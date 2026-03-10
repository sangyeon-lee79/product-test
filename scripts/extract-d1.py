#!/usr/bin/env python3
"""Extract data from local D1 SQLite and output PostgreSQL-compatible INSERT statements."""

import sqlite3
import sys
import os
import uuid
import json

DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'services/api/.wrangler/state/v3/d1/miniflare-D1DatabaseObject',
    'cfcaf0bc4c629dfaa5a843bf777fcec4b2f2e45d3f14bdef9b36c8141e69b2f6.sqlite'
)

# Boolean column names (SQLite stores as 0/1, PG needs true/false)
BOOL_PREFIXES = ('is_', 'has_', 'can_')
BOOL_EXACT = {
    'active', 'enabled', 'verified', 'email_verified',
    'visible', 'published', 'deleted', 'archived',
}

# Tables to skip
SKIP_TABLES = {
    'd1_migrations', 'schema_migrations',
    'booking_completion_contents',
    'pet_diseases',  # not in PG schema (disease data in master_items)
}

# Column renames: table → {old_col: new_col}
COL_RENAMES = {
    'master_categories': {'key': 'code'},
    'master_items': {'key': 'code', 'parent_id': 'parent_item_id'},
    'pets': {
        'guardian_id': 'guardian_user_id',
        'microchip_no': 'microchip_number',
        'gender': 'gender_legacy',
        'species': 'species_legacy',
    },
}

# Columns to drop (exist in D1 but not in PG, replaced by transformed cols)
COL_DROPS = {
    'master_categories': {'is_active'},
    'master_items': {'is_active'},
}

# Extra columns to add with value derived from row
# table → [(col_name, value_fn(row_dict))]
def mc_status(row):
    return "'active'" if row.get('is_active', 1) else "'inactive'"

def mi_status(row):
    return "'active'" if row.get('is_active', 1) else "'inactive'"

EXTRA_COLS = {
    'master_categories': [('status', mc_status)],
    'master_items': [('status', mi_status)],
}

# feeds → feed_posts mapping
FEEDS_TO_FEED_POSTS_COLS = [
    'id', 'author_user_id', 'author_role', 'feed_type',
    'visibility_scope', 'caption', 'status', 'created_at', 'updated_at'
]

def is_bool_col(name):
    if any(name.startswith(p) for p in BOOL_PREFIXES):
        return True
    return name in BOOL_EXACT

def escape_val(v, col_name):
    if v is None:
        return 'NULL'
    if isinstance(v, int) and is_bool_col(col_name):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, str):
        escaped = v.replace("'", "''")
        return f"'{escaped}'"
    if isinstance(v, bytes):
        return f"'\\x{v.hex()}'"
    escaped = str(v).replace("'", "''")
    return f"'{escaped}'"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute(
    "SELECT name FROM sqlite_master WHERE type='table' "
    "AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' "
    "ORDER BY name"
)
tables = [r[0] for r in cur.fetchall()]

for table in tables:
    if table in SKIP_TABLES:
        continue

    rows = cur.execute(f'SELECT * FROM [{table}]').fetchall()
    if not rows:
        continue

    cols = [desc[0] for desc in cur.execute(f'SELECT * FROM [{table}] LIMIT 1').description]

    # Special: feeds → feed_posts
    if table == 'feeds':
        target_cols = FEEDS_TO_FEED_POSTS_COLS
        col_indices = [(cols.index(tc) if tc in cols else None) for tc in target_cols]
        col_list = ', '.join(f'"{c}"' for c in target_cols)

        for row in rows:
            vals = []
            for i, idx in enumerate(col_indices):
                vals.append('NULL' if idx is None else escape_val(row[idx], target_cols[i]))
            print(f'INSERT INTO "feed_posts" ({col_list}) VALUES ({", ".join(vals)}) ON CONFLICT DO NOTHING;')

            # feed_post_pets
            pet_id_idx = cols.index('pet_id') if 'pet_id' in cols else None
            if pet_id_idx is not None and row[pet_id_idx]:
                fpp_id = str(uuid.uuid4())
                print(f"INSERT INTO \"feed_post_pets\" (\"id\", \"post_id\", \"pet_id\") VALUES ('{fpp_id}', '{row[cols.index('id')]}', '{row[pet_id_idx]}') ON CONFLICT DO NOTHING;")

            # feed_media
            media_idx = cols.index('media_urls') if 'media_urls' in cols else None
            if media_idx is not None and row[media_idx]:
                try:
                    urls = json.loads(row[media_idx])
                    for si, url in enumerate(urls):
                        fm_id = str(uuid.uuid4())
                        print(f"INSERT INTO \"feed_media\" (\"id\", \"post_id\", \"media_url\", \"media_type\", \"sort_order\") VALUES ('{fm_id}', '{row[cols.index('id')]}', '{url.replace(chr(39), chr(39)+chr(39))}', 'image', {si}) ON CONFLICT DO NOTHING;")
                except:
                    pass
        continue

    # Apply column renames and drops
    renames = COL_RENAMES.get(table, {})
    drops = COL_DROPS.get(table, set())
    extras = EXTRA_COLS.get(table, [])

    # Filter out dropped columns
    active_indices = [i for i, c in enumerate(cols) if c not in drops]
    pg_cols = [renames.get(cols[i], cols[i]) for i in active_indices]

    # Add extra column names
    extra_names = [e[0] for e in extras]
    all_pg_cols = pg_cols + extra_names
    col_list = ', '.join(f'"{c}"' for c in all_pg_cols)

    for row in rows:
        # Build row dict for extra col functions
        row_dict = {cols[i]: row[i] for i in range(len(cols))}

        vals = []
        for i in active_indices:
            v = row[i]
            if cols[i] == 'id' and v is None:
                v = str(uuid.uuid4()).replace('-', '')
            vals.append(escape_val(v, cols[i]))

        # Add extra column values
        for _, fn in extras:
            vals.append(fn(row_dict))

        print(f'INSERT INTO "{table}" ({col_list}) VALUES ({", ".join(vals)}) ON CONFLICT DO NOTHING;')

conn.close()
print(f'-- Done: {len(tables)} tables processed', file=sys.stderr)
