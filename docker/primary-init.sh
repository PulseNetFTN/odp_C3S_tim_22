#!/bin/bash
set -e

echo "[init] Creating replication user..."
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-SQL
    CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator123';
SQL

echo "[init] Allowing replication connections..."
echo "host  replication  replicator  0.0.0.0/0  md5" >> "$PGDATA/pg_hba.conf"

echo "[init] Done."
