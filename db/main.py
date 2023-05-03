import sqlite3
import time
from migrator import DBMigrator

if __name__ == '__main__':
    db = sqlite3.connect("dev.db")
    schema_sql = open("schema.sql").read()
    v, = db.execute("PRAGMA user_version").fetchone()
    journal_mode, = db.execute("PRAGMA journal_mode").fetchone()

    print(f"Running... user_version={v} journal_mode={journal_mode}")

    if v == 0:
        # Initialising database from scratch.
        '''
        *******************************************************
        * WARNING: allow_deletions=True can cause data loss!  *
        *******************************************************
        '''
        with DBMigrator(db, schema_sql, allow_deletions=True) as migrator:
            migrator.migrate()
            migrator.inspect_tables()
    elif v == 1:
        with DBMigrator(db, schema_sql) as migrator:

            # Manual migration: Drop obsolete tables so that `migrate`
            # doesn't complain in prod where `allow_deletions=False`.
            db.execute("DROP TABLE IF EXISTS _prisma_migrations")

            # Now do the automatic migration:
            migrator.migrate()

            # Additional data migration to populate new "end_time" column.
            # Note the careful WHERE clause to make this idempotent.
            db.execute("""\
                UPDATE Task SET end_time = :now
                WHERE result IS NOT NULL AND end_time IS NULL""",
                       {"now": time.time()})

    else:
        raise RuntimeError(
            f"Database is at version {v}. This version of software "
            "only supports opening versions 0 or 1. Bailing out "
            "to avoid data loss.")

    print("Done.")
