#!/bin/sh
set -e

PGDATA=/var/lib/postgresql/data
PRIMARY_HOST=pulsenet-master
PRIMARY_PORT=5432
REPL_USER=replicator

# On restart the data dir already exists  start postgres directly
if [ -s "$PGDATA/PG_VERSION" ]; then
    echo "[replica] Data directory found, starting as standby..."
    chmod 700 "$PGDATA"
    exec gosu postgres postgres
fi

echo "[replica] Waiting for primary at $PRIMARY_HOST:$PRIMARY_PORT..."
until pg_isready -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U pulsenet -q; do
    sleep 2
done
echo "[replica] Primary is ready."

echo "[replica] Cloning primary with pg_basebackup..."
# Cannot rm -rf a volume mount point — clear its contents instead
find "$PGDATA" -mindepth 1 -delete 2>/dev/null || true
chown postgres:postgres "$PGDATA"
chmod 700 "$PGDATA"

# -R writes standby.signal + primary_conninfo to postgresql.auto.conf automatically
gosu postgres pg_basebackup \
    -h "$PRIMARY_HOST" \
    -p "$PRIMARY_PORT" \
    -U "$REPL_USER" \
    -D "$PGDATA" \
    --wal-method=stream \
    --checkpoint=fast \
    --progress \
    --verbose \
    -R

echo "[replica] Clone complete. Starting standby postgres..."
exec gosu postgres postgres
