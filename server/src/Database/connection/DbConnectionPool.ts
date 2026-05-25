import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";
import { ServiceResult } from "../../Domain/types/ServiceResult";

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

const masterNode: DbNode = {
    pool: mysql.createPool({
        host: process.env.DB_MASTER_HOST ?? 'localhost',
        port: Number(process.env.DB_MASTER_PORT) || 3306,
        user: process.env.DB_USER ?? '',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? '',
        waitForConnections: true,
        connectionLimit: 10,
    }),
    status: 'healthy',
    responseTime: 0,
    lastChecked: null,
    name: 'master',
};

const slaveNodes: DbNode[] = [
    {
        pool: mysql.createPool({
            host: process.env.DB_SLAVE1_HOST,
            port: Number(process.env.DB_SLAVE1_PORT) || 3307,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
        }),
        status: 'healthy',
        responseTime: 0,
        lastChecked: null,
        name: 'slave1',
    },
    {
        pool: mysql.createPool({
            host: process.env.DB_SLAVE2_HOST,
            port: Number(process.env.DB_SLAVE2_PORT) || 3308,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
        }),
        status: 'healthy',
        responseTime: 0,
        lastChecked: null,
        name: 'slave2',
    },
];

let currentMaster: DbNode = masterNode;
let currentSlaveIndex = 0;
let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

async function checkNode(node: DbNode): Promise<void> {
    const start = Date.now();
    try {
        const conn = await node.pool.getConnection();
        await conn.query('SELECT 1');
        conn.release();
        const elapsed = Date.now() - start;
        node.responseTime = elapsed;
        node.status = elapsed > DEGRADED_THRESHOLD_MS ? 'degraded' : 'healthy';
    } catch {
        node.status = 'unreachable';
        node.responseTime = -1;
    } finally {
        node.lastChecked = new Date();
    }
}

export function startHealthCheck(intervalMS: number = 10000): void {
    if (healthCheckInterval) return;

    healthCheckInterval = setInterval(async () => {
        await checkNode(currentMaster);

        for (const slave of slaveNodes) {
            await checkNode(slave);
        }

        if (currentMaster.status === 'unreachable') {
            const healthySlave = slaveNodes.find(s => s.status !== 'unreachable');
            if (healthySlave) {
                console.warn(`[db] Master unreachable, promoting ${healthySlave.name} to master`);
                currentMaster = healthySlave;
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
            return { success: false, message: 'No DB node is available' };
        }
        return { success: true, data: currentMaster.pool };
    }

    const slave = healthySlaves[currentSlaveIndex % healthySlaves.length];
    currentSlaveIndex++;
    return { success: true, data: slave.pool };
}

export function getHealthStatus() {
    return {
        master: {
            status: currentMaster?.status ?? 'unreachable' as const,
            latency: currentMaster?.responseTime ?? 0,
            lastChecked: currentMaster?.lastChecked?.toISOString() ?? new Date().toISOString(),
        },
        slave1: {
            status: slaveNodes[0]?.status ?? 'unreachable' as const,
            latency: slaveNodes[0]?.responseTime ?? 0,
            lastChecked: slaveNodes[0]?.lastChecked?.toISOString() ?? new Date().toISOString(),
        },
        slave2: {
            status: slaveNodes[1]?.status ?? 'unreachable' as const,
            latency: slaveNodes[1]?.responseTime ?? 0,
            lastChecked: slaveNodes[1]?.lastChecked?.toISOString() ?? new Date().toISOString(),
        },
    };
}

export function promoteSlaveToMaster(slaveIdx: number): ServiceResult<string> {
    const slave = slaveNodes[slaveIdx];
    if (!slave) {
        return { success: false, message: `Slave on index ${slaveIdx} does not exist` };
    }
    console.warn(`[db] Manual promotion: ${slave.name} became master`);
    currentMaster = slave;
    return { success: true, data: slave.name };
}
