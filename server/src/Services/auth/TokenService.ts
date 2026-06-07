import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../Domain/enums/UserRole';


export interface AccessTokenPayload {
    id: number;
    username: string;
    role: UserRole;
}

export class TokenService {
    private readonly accessSecret: string;
    private readonly accessExpiresIn: number;
    private readonly refreshExpiresDays: number;

    constructor() {
        if (!process.env.JWT_ACCESS_SECRET) {
            throw new Error('JWT_ACCESS_SECRET Is required');
        }
        this.accessSecret = process.env.JWT_ACCESS_SECRET;
        this.accessExpiresIn = parseInt(process.env.JWT_ACCESS_EXPIRY_SECONDS ?? '900', 10);
        this.refreshExpiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS ?? '7', 10);
    }

    signAccessToken(payload: AccessTokenPayload): string {
        return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpiresIn });
    }

    verifyAccessToken(token: string): AccessTokenPayload | null {
        try {
            return jwt.verify(token, this.accessSecret) as AccessTokenPayload;
        } catch {
            return null;
        }
    }

    generateRefreshToken(): { raw: string; hash: string; expiresAt: Date } {
        const raw = crypto.randomBytes(64).toString('hex');
        const hash = crypto.createHash('sha256').update(raw).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresDays);
        return { raw, hash, expiresAt };
    }

    hashToken(raw: string): string {
        return crypto.createHash('sha256').update(raw).digest('hex');
    }
}