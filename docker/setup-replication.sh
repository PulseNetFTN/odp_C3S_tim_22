#!/bin/sh
# Replication is configured automatically on first docker compose up.
# Run this script to verify replication status across all three nodes.

DB_NAME="pulsenet"
export PGPASSWORD="root"

echo ""
echo "========================================================"
echo "  PulseNet PostgreSQL Replication Status"
echo "========================================================"

wait_pg() {
    HOST=$1; NAME=$2
    printf "  Waiting for %s" "$NAME"
    i=0
    while [ $i -lt 30 ]; do
        pg_isready -h "$HOST" -p 5432 -U pulsenet -q \
            && echo " OK" && return 0
        printf "."; sleep 3; i=$((i+1))
    done
    echo " TIMEOUT"; exit 1
}

echo ""
echo "[ 1/3 ] Checking node availability..."
wait_pg "127.0.0.1"       "Master"
wait_pg "pulsenet-slave1" "Slave1"
wait_pg "pulsenet-slave2" "Slave2"

echo ""
echo "[ 2/3 ] Primary WAL sender status..."
psql -h 127.0.0.1 -p 5432 -U pulsenet -d "$DB_NAME" -w -c "
    SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn, sync_state
    FROM pg_stat_replication;
"

echo ""
echo "[ 3/3 ] Replica recovery status..."
for SLAVE_HOST in pulsenet-slave1 pulsenet-slave2; do
    echo ""
    echo "  --- $SLAVE_HOST ---"
    psql -h "$SLAVE_HOST" -p 5432 -U pulsenet -d "$DB_NAME" -w -c "
        SELECT pg_is_in_recovery()                              AS is_standby,
               pg_last_wal_receive_lsn()                       AS received_lsn,
               pg_last_wal_replay_lsn()                        AS replayed_lsn,
               now() - pg_last_xact_replay_timestamp()         AS replication_lag;
    " 2>/dev/null || echo "  Could not connect to $SLAVE_HOST"
done

echo ""
echo "========================================================"
echo "  Master:  pulsenet-master   port 5432"
echo "  Slave1:  pulsenet-slave1   port 5433"
echo "  Slave2:  pulsenet-slave2   port 5434"
echo "  DB:      ${DB_NAME}"
echo ""
echo "  Start:   docker compose up -d"
echo "  Reset:   docker compose down -v && docker compose up -d"
echo "========================================================"
