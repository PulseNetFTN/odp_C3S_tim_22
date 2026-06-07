import { Pool, QueryResultRow } from 'pg';
import { getReadConnection, getWriteConnection } from '../connection/DbConnectionPool';
import { RepositoryResult } from '../../Domain/types/RepositoryResult';

type QueryParam = string | number | boolean | null | Buffer | Date;
type QueryParams = QueryParam[];

export interface WriteResult {
    insertId?: number;
    affectedRows: number;
}
export abstract class BaseRepository {

    protected async executeRead<T>(
        query: string,
        params: QueryParams,
        mapper: (row: QueryResultRow) => T
    ): Promise<T[]> {
        const conn = getReadConnection();
        if (!conn.success || !conn.data) return [];
        try {
            const result = await conn.data.query(query, params);
            return result.rows.map(mapper);
        } catch(err) {
            console.error('[db] read failed:', (err as Error).message);
            return [];
        }
    }
    protected async executeReadOne<T>(
        query: string,
        params: QueryParams,
        mapper: (row: QueryResultRow) => T
    ): Promise<RepositoryResult<T>> {
        const conn = getReadConnection();
        if (!conn.success || !conn.data) {
            return RepositoryResult.failure('Read connection unavailable');
        }
        try {
            const result = await conn.data.query(query, params);
            if (result.rows.length === 0) return RepositoryResult.notFound();
            return RepositoryResult.success(mapper(result.rows[0]));
        } catch (err) {
            console.error('[db] readOne failed:', (err as Error).message);
            return RepositoryResult.failure('Database read error');
        }
    }

    protected async executeWrite(
        query: string,
        params: QueryParams,
    ): Promise<RepositoryResult<WriteResult>> {
        const conn = getWriteConnection();
        if (!conn.success || !conn.data) {
            return RepositoryResult.failure('Write connection unavailable');
        }
        try {
            const result = await conn.data.query(query, params);
            return RepositoryResult.success({
                insertId: result.rows[0]?.id ?? undefined,
                affectedRows: result.rowCount ?? 0,
            });
        } catch (err) {
            console.error('[db] write failed:', (err as Error).message);
            return RepositoryResult.failure('Database write error');
        }
    }

    protected async executeScalar<T>(
        query: string,
        params: QueryParams,
        field: string = 'count'
    ): Promise<RepositoryResult<T>> {
        const conn = getReadConnection();
        if (!conn.success || !conn.data) {
            return RepositoryResult.failure('Read connection unavailable');
        }
        try {
            const result = await conn.data.query(query, params);
            if (result.rows.length === 0) return RepositoryResult.notFound();
            return RepositoryResult.success(result.rows[0][field] as T);
        } catch (err) {
            console.error('[db] scalar failed:', (err as Error).message);
            return RepositoryResult.failure('Database read error');
        }
    }

    protected buildPlaceholders(items: QueryParams, offset = 0): string {
        return items.map((_, i) => `$${i + offset + 1}`).join(', ');
    }
}