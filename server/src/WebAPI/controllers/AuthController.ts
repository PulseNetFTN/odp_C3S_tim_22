import { Request, Response, Router } from 'express';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { validateLogin, validateRegister } from '../validators/AuthValidator';
import { sendServiceResult } from '../helpers/responseHelper';
import { IAuditService } from '../../Domain/services/audit/IAuditService';
import jwt from 'jsonwebtoken';

export class AuthController {
    private router: Router;
    private authService: IAuthService;
   

    constructor(authService: IAuthService, private auditService: IAuditService) {
        this.router = Router();
        this.authService = authService;
        this.auditService = this.auditService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/auth/login', this.login.bind(this));
        this.router.post('/auth/register', this.register.bind(this));
        this.router.post('/auth/logout', authenticate, this.logout.bind(this));
    }

    private async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, password } = req.body;

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

            const token = jwt.sign(
                { id: result.data.id, username: result.data.username, role: result.data.role },
                process.env.JWT_SECRET ?? '',
                { expiresIn: '6h' }
            );

            res.status(200).json({ success: true, message: 'Login successful', data: token });
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

            const result = await this.authService.register({username, email, firstName, lastName, password, bio, profileImage});
            if (!result.success || !result.data) {
                sendServiceResult(res, result);
                return;
            }

            const token = jwt.sign(
                { id: result.data.id, username: result.data.username, role: result.data.role },
                process.env.JWT_SECRET ?? '',
                { expiresIn: '6h' }
            );

            res.status(201).json({ success: true, message: 'Registration successful', data: token });
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async logout(req: Request, res: Response): Promise<void> {
        try {
        await this.auditService.log({
            userId: req.user!.id,
            action: 'LOGOUT',
            entityType: 'user',
            entityId: req.user!.id,
            ipAddress: req.ip ?? undefined,
            userAgent: req.headers['user-agent'] ?? undefined,
        });     
            res.status(200).json({ success: true, message: 'Logout successful' });
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}