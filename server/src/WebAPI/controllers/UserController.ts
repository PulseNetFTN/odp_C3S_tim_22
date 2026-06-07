import { Request, Response, Router } from 'express';
import { IUserService } from '../../Domain/services/users/IUserService';
import { authenticate, optionalAuthenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';
import { validateProfileUpdate } from '../validators/UserValidator';
import { sendServiceResult } from '../helpers/responseHelper';

export class UserController {
    private router: Router;
    private userService: IUserService;

    constructor(userService: IUserService) {
        this.router = Router();
        this.userService = userService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/users/all', authenticate, authorize(UserRole.Admin), this.getAllUsers.bind(this));
        this.router.get('/users/search', authenticate, this.searchUsers.bind(this));
        this.router.get('/users/me', authenticate, this.getMe.bind(this));
        this.router.put('/users/me', authenticate, this.updateProfile.bind(this));
        this.router.get('/users/:id', optionalAuthenticate, this.getUserById.bind(this));
        this.router.put('/users/:id/role', authenticate, authorize(UserRole.Admin), this.updateRole.bind(this));
        this.router.get('/users/:id/followers', this.getFollowers.bind(this));
        this.router.get('/users/:id/following', this.getFollowing.bind(this));
        this.router.post('/users/:id/follow', authenticate, this.follow.bind(this));
        this.router.delete('/users/:id/follow', authenticate, this.unfollow.bind(this));
    }

    private async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.userService.getAllUsers();
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async searchUsers(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.q as string;
            if (!query || query.trim().length < 1) {
                res.status(400).json({ success: false, message: 'Search query is required' });
                return;
            }
            const result = await this.userService.searchUsers({ query: query.trim() });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getMe(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.userService.getUserProfile(req.user!.id, req.user!.id);
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const currentUserId = req.user?.id;
            const result = await this.userService.getUserProfile(id, currentUserId);
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const { username, email, firstName, lastName, bio, profileImage, password, currentPassword } = req.body;
            const validation = validateProfileUpdate(username, email, firstName, lastName, bio, password);
            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }
            const result = await this.userService.updateProfile({
                userId: req.user!.id, username, email, firstName, lastName, bio, profileImage, password, currentPassword
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async updateRole(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            const { role } = req.body;
            if (isNaN(id) || !Object.values(UserRole).includes(role)) {
                res.status(400).json({ success: false, message: 'Invalid data' });
                return;
            }
            const result = await this.userService.updateRole({ userId: id, role });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getFollowers(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.userService.getFollowers({ userId: id });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getFollowing(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.userService.getFollowing({ userId: id });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async follow(req: Request, res: Response): Promise<void> {
        try {
            const followingId = parseInt(String(req.params.id));
            if (isNaN(followingId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.userService.followUser({
                followerId: req.user!.id, followingId,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async unfollow(req: Request, res: Response): Promise<void> {
        try {
            const followingId = parseInt(String(req.params.id));
            if (isNaN(followingId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.userService.unfollowUser({
                followerId: req.user!.id, followingId,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}
