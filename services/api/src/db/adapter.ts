// D1-compatible adapter wrapping 'pg' (node-postgres) via Cloudflare Hyperdrive.
// Provides the same .prepare().bind().all()/.first()/.run() interface as Cloudflare D1
// so that 452+ existing env.DB.prepare() call sites work without changes.

import { Client, types } from 'pg';

// PostgreSQL COUNT(*) returns bigint (OID 20), which node-postgres serializes as string.
// Override to return JavaScript number for correct frontend type checks.
types.setTypeParser(20, (val: string) => {
  const n = Number(val);
  return Number.isSafeInteger(n) ? n : val; // keep string if exceeds safe integer range
});
// Also handle numeric (OID 1700) for COALESCE(COUNT(*), 0) cases
types.setTypeParser(1700, (val: string) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : val;
});

// ─── D1-compatible type definitions ──────────────────────────────────────────

export interface D1CompatResult<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { changes: number; last_row_id: number; rows_read: number; rows_written: number };
}

export interface D1CompatBoundStatement {
  all<T = Record<string, unknown>>(): Promise<D1CompatResult<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<D1CompatResult>;
}

export interface D1CompatStatement extends D1CompatBoundStatement {
  bind(...values: unknown[]): D1CompatBoundStatement;
}

export interface D1CompatDatabase {
  prepare(sql: string): D1CompatStatement;
}

// ─── Placeholder conversion ──────────────────────────────────────────────────

/** Convert D1-style `?` placeholders to PostgreSQL-style `$1, $2, ...` */
function convertPlaceholders(sql: string): string {
  let index = 0;
  let inSingleQuote = false;
  let result = '';

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    if (ch === "'" && (i === 0 || sql[i - 1] !== '\\')) {
      inSingleQuote = !inSingleQuote;
      result += ch;
    } else if (ch === '?' && !inSingleQuote) {
      result += `$${++index}`;
    } else {
      result += ch;
    }
  }
  return result;
}

// ─── Adapter factory ─────────────────────────────────────────────────────────

export function createDbAdapter(connectionString: string): D1CompatDatabase {
  return {
    prepare(query: string): D1CompatStatement {
      const pgQuery = convertPlaceholders(query);
      let boundValues: unknown[] = [];

      const makeMeta = (rowCount: number) => ({
        changes: 0,
        last_row_id: 0,
        rows_read: rowCount,
        rows_written: 0,
      });

      const exec = async (q: string) => {
        const client = new Client(connectionString);
        await client.connect();
        try {
          const result = await client.query(q, boundValues);
          return result.rows as Record<string, unknown>[];
        } finally {
          // Context.waitUntil not needed — Hyperdrive manages the pool
          client.end().catch(() => {});
        }
      };

      const bound: D1CompatBoundStatement = {
        async all<T = Record<string, unknown>>(): Promise<D1CompatResult<T>> {
          const rows = (await exec(pgQuery)) as T[];
          return { results: rows, success: true, meta: makeMeta(rows.length) };
        },
        async first<T = Record<string, unknown>>(): Promise<T | null> {
          const q = /\bLIMIT\s+\d/i.test(pgQuery) ? pgQuery : `${pgQuery} LIMIT 1`;
          const rows = (await exec(q)) as T[];
          return (rows[0] as T) ?? null;
        },
        async run(): Promise<D1CompatResult> {
          await exec(pgQuery);
          return { results: [], success: true, meta: makeMeta(0) };
        },
      };

      return {
        bind(...values: unknown[]): D1CompatBoundStatement {
          boundValues = values;
          return bound;
        },
        all: bound.all,
        first: bound.first,
        run: bound.run,
      };
    },
  };
}
