import { Request, Response, Router } from 'express';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import { IAuditService } from '../../Domain/services/audit/IAuditService';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { validateLogin, validateRegister } from '../validators/AuthValidator';
import { sendServiceResult } from '../helpers/responseHelper';

const COOKIE_NAME = 'refreshToken';
const COOKIE_PATH = '/api/v1/auth';

export class AuthController {
    private readonly router: Router;

    constructor(
        private readonly authService: IAuthService,
        private readonly auditService: IAuditService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() : void {
        this.router.post('/auth/login', this.login.bind(this));
        this.router.post('/auth/register', this.register.bind(this));
        this.router.post('/auth/refresh', this.refresh.bind(this));
        this.router.post('/auth/logout', authenticate, this.logout.bind(this));        
    }

    private setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'strict',
            path: COOKIE_PATH,
            expires: expiresAt,
        });
    }

    private async login(req: Request, res: Response): Promise<void> {
        try {
            const {username, password} = req.body;
            const validation = validateLogin(username, password);
            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }
            const result = await this.authService.login({username, password}); 
                if (!result.success || !result.data) {
                sendServiceResult(res, result);
                return;
            }           

            this.setRefreshCookie(res, result.data.refreshToken, result.data.refreshExpiresAt);
            res.status(200).json({ success: true, message: 'Login successful', data: { accessToken: result.data.accessToken } });
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, email, firstName, lastName, password, bio, profileImage } = req.body;
            const validation = validateRegister(username, email, firstName, lastName, password, bio);
            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }    
            const result = await this.authService.register({ username, email, firstName, lastName, password, bio, profileImage });
            if (!result.success || !result.data) {
                sendServiceResult(res, result);
                return;
            }
            this.setRefreshCookie(res, result.data.refreshToken, result.data.refreshExpiresAt);
            res.status(201).json({ success: true, message: 'Registration successful', data: { accessToken: result.data.accessToken } });
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async refresh(req: Request, res: Response): Promise<void> {
        try {
            const raw = req.cookies?.[COOKIE_NAME];
            if (!raw) {
                res.status(401).json({ success: false, message: 'No refresh token' });
                return;
            } 
            const result = await this.authService.refresh(raw);
            if(!result.success || !result.data) {
                res.clearCookie(COOKIE_NAME, {path: COOKIE_PATH});
                sendServiceResult(res, result);
                return
            }
            this.setRefreshCookie(res, result.data.refreshToken, result.data.refreshExpiresAt);
            res.status(200).json({ success: true, data: { accessToken: result.data.accessToken } });
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async logout(req: Request, res: Response): Promise<void> {
        try {
            const raw = req.cookies?.[COOKIE_NAME];
            if (raw) {
                await this.authService.logout(raw);
            }
            await this.auditService.log({
                userId: req.user!.id,
                action: 'LOGOUT',
                entityType: 'user',
                entityId: req.user!.id,
                ipAddress: req.ip ?? undefined,
                userAgent: req.headers['user-agent'] ?? undefined,
            });
            res.clearCookie(COOKIE_NAME, { path: COOKIE_PATH });
            res.status(200).json({ success: true, message: 'Logout successful' });
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

     public getRouter(): Router {
        return this.router;
    }   
}