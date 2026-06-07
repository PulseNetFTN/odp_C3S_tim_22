import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import { ServiceResult } from '../../Domain/types/ServiceResult';

dotenv.config();

type NodeStatus = 'healthy' | 'degraded' | 'unreachable';

interface DbNode {
    pool: Pool;
    status: NodeStatus;
    responseTime: number;
    lastChecked: Date | null;
    name: string;
}

interface HealthStatus {
    name: string;
    status: NodeStatus;
    responseTime: number;
    lastChecked: Date | null;
}

const DEGRADED_THRESHOLD_MS = 500;

function makePool(host: string, port: number): Pool {
    return new Pool({
        host,
        port,
        user: process.env.DB_USER ?? '',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? '',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
    });
}

const SINGLE_NODE = !process.env.DB_SLAVE1_HOST;

if (SINGLE_NODE) {
    console.info('[db] Single-node mode  reads and writes go to primary');
}

const masterNode: DbNode = {
    pool: makePool(
        process.env.DB_MASTER_HOST ?? process.env.DB_HOST ?? 'localhost',
        Number(process.env.DB_MASTER_PORT ?? process.env.DB_PORT) || 5432
    ),
    status: 'healthy',
    responseTime: 0,
    lastChecked: null,
    name: 'master',
};

const slaveNodes: DbNode[] = SINGLE_NODE ? [] : [
    {
        pool: makePool(
            process.env.DB_SLAVE1_HOST!,
            Number(process.env.DB_SLAVE1_PORT) || 5432
        ),
        status: 'unreachable',
        responseTime: 0,
        lastChecked: null,
        name: 'slave1',
    },
    ...(process.env.DB_SLAVE2_HOST ? [{
        pool: makePool(
            process.env.DB_SLAVE2_HOST,
            Number(process.env.DB_SLAVE2_PORT) || 5432
        ),
        status: 'unreachable' as NodeStatus,
        responseTime: 0,
        lastChecked: null,
        name: 'slave2',
    }] : []),
];

let currentMaster: DbNode = masterNode;
let currentSlaveIndex = 0;
let healthCheckInterval: ReturnType<typeof setInterval> | null = null;
let promoting = false;

async function checkNode(node: DbNode): Promise<void> {
    const start = Date.now();
    const prevStatus = node.status;
    let client: PoolClient | null = null;

    try {
        client = await node.pool.connect();
        await client.query('SELECT 1');
        const elapsed = Date.now() - start;
        node.responseTime = elapsed;
        node.status = elapsed > DEGRADED_THRESHOLD_MS ? 'degraded' : 'healthy';
    } catch (err) {
        node.status = 'unreachable';
        node.responseTime = -1;
        console.error(`[db] ${node.name} connection failed: ${(err as Error).message}`);
    } finally {
        client?.release();
        node.lastChecked = new Date();
    }

    if (prevStatus !== node.status) {
        console.warn(`[db] ${node.name} status changed: ${prevStatus} -> ${node.status}`);
    }
}

export function startHealthCheck(intervalMS: number = 10_000): void {
    if (healthCheckInterval) return;

    healthCheckInterval = setInterval(async () => {
        await checkNode(currentMaster);
        for (const slave of slaveNodes) {
            await checkNode(slave);
        }

        if (currentMaster.status === 'unreachable' && !promoting) {
            const candidate = slaveNodes.find(s => s !== currentMaster && s.status !== 'unreachable');
            if (candidate) {
                promoting = true;
                let c: PoolClient | null = null;
                try {
                    c = await candidate.pool.connect();
                    await c.query('SELECT pg_promote()');
                    console.warn(`[db] Promoted ${candidate.name} to primary`);
                    currentMaster = candidate;
                } catch (err) {
                    console.error(`[db] Failed to promote ${candidate.name}: ${(err as Error).message}`);
                } finally {
                    c?.release();
                    promoting = false;
                }
            }
        }
    }, intervalMS);
}

export function getWriteConnection(): ServiceResult<Pool> {
    if (currentMaster.status === 'unreachable') {
        return { success: false, message: 'Master node is unreachable, writing is not available' };
    }
    return { success: true, data: currentMaster.pool };
}

export function getReadConnection(): ServiceResult<Pool> {
    const healthySlaves = slaveNodes.filter(
        s => s !== currentMaster && s.status !== 'unreachable'
    );

    if (healthySlaves.length === 0) {
        if (currentMaster.status === 'unreachable') {
            return { success: false, message: 'No database node is available' };
        }
        return { success: true, data: currentMaster.pool };
    }

    const slave = healthySlaves[currentSlaveIndex % healthySlaves.length];
    currentSlaveIndex++;
    return { success: true, data: slave.pool };
}

export function getHealthStatus(): HealthStatus[] {
    return [currentMaster, ...slaveNodes].map(node => ({
        name: node.name,
        status: node.status,
        responseTime: node.responseTime,
        lastChecked: node.lastChecked,
    }));
}

export function promoteSlaveToMaster(slaveIdx: number): ServiceResult<string> {
    const slave = slaveNodes[slaveIdx];
    if (!slave) {
        return { success: false, message: `Slave at index ${slaveIdx} does not exist` };
    }
    console.warn(`[db] Manual promotion: ${slave.name} became master`);
    currentMaster = slave;
    return { success: true, data: slave.name };
}
