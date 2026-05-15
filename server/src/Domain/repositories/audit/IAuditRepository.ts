import { Audit } from '../../models/Audit';

export interface IAuditRepository {
    create(audit: Audit): Promise<Audit | null>;
    getAll(limit: number, offset: number) : Promise<Audit[]>;
    getByUserId(userId: number, limit: number, offset: number): Promise<Audit[]>;
    getTotalCount(): Promise<number>;
}