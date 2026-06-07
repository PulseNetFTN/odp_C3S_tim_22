import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../Domain/enums/UserRole';

interface JwtPayload {
    id: number;
    username: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
if (!ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is required');
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Missing token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, ACCESS_SECRET!) as JwtPayload;
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, ACCESS_SECRET!) as JwtPayload;
        req.user = decoded;
    } catch {
        // invalid token, treat as unauthenticated
    }
    next();
};
