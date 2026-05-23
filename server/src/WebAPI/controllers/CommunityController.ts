import { Request, Response, Router } from 'express';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';
import { sendServiceResult } from '../helpers/responseHelper';
import { ICommunityService } from '../../Domain/services/communities/ICommunityService';
import { validateCreateCommunity } from '../validators/CommunityValidator';

export class CommunityController {
    private router: Router;
    private communityService: ICommunityService;

    constructor(communityService: ICommunityService) {
        this.router = Router();
        this.communityService = communityService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/communities/mine', authenticate, this.getMyCommunities.bind(this));
        this.router.get('/communities/public', this.getPublicCommunities.bind(this));
        this.router.get('/communities/search', this.searchCommunities.bind(this));
        this.router.get('/communities/all', authenticate, authorize(UserRole.Admin), this.getAllCommunities.bind(this));
        this.router.get('/communities/:id', this.getCommunityById.bind(this));
        this.router.get('/users/:id/communities', this.getUserCommunities.bind(this));
        this.router.post('/communities', authenticate, this.createCommunity.bind(this));
        this.router.put('/communities/:id', authenticate, this.updateCommunity.bind(this));
        this.router.delete('/communities/:id', authenticate, this.deleteCommunity.bind(this));
        this.router.post('/communities/:id/join', authenticate, this.joinCommunity.bind(this));
        this.router.delete('/communities/:id/leave', authenticate, this.leaveCommunity.bind(this));
    }

    private async createCommunity(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, rules, avatar, type } = req.body;

            const validation = validateCreateCommunity(name, description, type);
            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            const result = await this.communityService.createCommunity({
                name, description, rules, avatar, type, creatorId: req.user!.id,
            });
            sendServiceResult(res, result, 201);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getCommunityById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.communityService.getCommunityById({ communityId: id });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getAllCommunities(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.communityService.getAllCommunities();
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getPublicCommunities(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.communityService.getPublicCommunities();
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getMyCommunities(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.communityService.getUserCommunities({ userId: req.user!.id });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getUserCommunities(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(String(req.params.id));
            if (isNaN(userId)) {
                res.status(400).json({ success: false, message: 'Invalid user ID' });
                return;
            }
            const result = await this.communityService.getUserCommunities({ userId });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async searchCommunities(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.q as string;
            if (!query || query.trim().length < 1) {
                res.status(400).json({ success: false, message: 'Search query is required' });
                return;
            }
            const result = await this.communityService.searchCommunities({ query: query.trim() });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async updateCommunity(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const { name, description, rules, avatar, type } = req.body;
            const result = await this.communityService.updateCommunity({
                communityId: id, requesterId: req.user!.id, name, description, rules, avatar, type,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async deleteCommunity(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid Community ID' });
                return;
            }
            const result = await this.communityService.deleteCommunity({
                communityId: id, requesterId: req.user!.id,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async joinCommunity(req: Request, res: Response): Promise<void> {
        try {
            const communityId = parseInt(String(req.params.id));
            if (isNaN(communityId)) {
                res.status(400).json({ success: false, message: 'Invalid community ID' });
                return;
            }
            const result = await this.communityService.joinCommunity({
                userId: req.user!.id, communityId,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async leaveCommunity(req: Request, res: Response): Promise<void> {
        try {
            const communityId = parseInt(String(req.params.id));
            if (isNaN(communityId)) {
                res.status(400).json({ success: false, message: 'Invalid community ID' });
                return;
            }
            const result = await this.communityService.leaveCommunity({
                userId: req.user!.id, communityId,
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