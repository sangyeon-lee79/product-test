/**
 * Migration runner for Neon PostgreSQL.
 * Reads all .sql files from pg-schema/ and executes them in order.
 * Handles:
 *   - Line-level SQL comment stripping (lines starting with --)
 *   - Statement splitting on ;\n boundaries
 *   - DO $$ ... END $$; PL/pgSQL blocks (preserved as single statements)
 */
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const DOLLAR_MARKER = '$$';

function parseStatements(content) {
  const cleaned = content.replace(/^\s*--[^\n]*/gm, '');
  const stmts = [];
  let buf = '';
  let inDollar = false;

  for (const part of cleaned.split(/;\s*\n/)) {
    buf = buf ? buf + ';\n' + part : part;
    const opens = (buf.match(/\$\$/g) || []).length;
    inDollar = opens % 2 !== 0;
    if (!inDollar) {
      const t = buf.trim();
      if (t) stmts.push(t);
      buf = '';
    }
  }
  if (buf.trim()) stmts.push(buf.trim());
  return stmts;
}

(async () => {
  const sql = neon(process.env.NEON_DATABASE_URL);
  const dir = path.join(__dirname, 'pg-schema');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log('Applying:', file);
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const stmts = parseStatements(content);
    for (const stmt of stmts) {
      await sql.query(stmt + ';');
    }
    console.log('Done:', file);
  }
  console.log('All migrations applied');
})().catch(e => {
  console.error(e.message);
  process.exit(1);
});
