import { Request, Response, Router } from 'express';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { sendServiceResult } from '../helpers/responseHelper';
import { ICommunityMemberService } from '../../Domain/services/communities/ICommunityMemberService';
import { UserRole } from '../../Domain/enums/UserRole';

export class CommunityMemberController {
    private router: Router;
    private communityMemberService: ICommunityMemberService;

    constructor(communityMemberService: ICommunityMemberService) {
        this.router = Router();
        this.communityMemberService = communityMemberService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/communities/:id/members', this.getMembers.bind(this));
        this.router.patch('/communities/:id/members/:userId/role', authenticate, this.updateMemberRole.bind(this));
        this.router.patch('/communities/:id/members/:userId/status', authenticate, this.updateMemberStatus.bind(this));
        this.router.delete('/communities/:id/members/:userId', authenticate, this.removeMember.bind(this));
    }

    private async getMembers(req: Request, res: Response): Promise<void> {
        try {
            const communityId = parseInt(String(req.params.id));
            if (isNaN(communityId)) {
                res.status(400).json({ success: false, message: 'Invalid community ID' });
                return;
            }
            const result = await this.communityMemberService.getMembers({ communityId });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async updateMemberRole(req: Request, res: Response): Promise<void> {
        try {
            const communityId = parseInt(String(req.params.id));
            const targetUserId = parseInt(String(req.params.userId));
            if (isNaN(communityId) || isNaN(targetUserId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const { role } = req.body;
            if (!role) {
                res.status(400).json({ success: false, message: 'Role is required' });
                return;
            }
            const result = await this.communityMemberService.updateMemberRole({
                communityId, targetUserId, requesterId: req.user!.id, requesterRole: req.user!.role as UserRole, role,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async updateMemberStatus(req: Request, res: Response): Promise<void> {
        try {
            const communityId = parseInt(String(req.params.id));
            const targetUserId = parseInt(String(req.params.userId));
            if (isNaN(communityId) || isNaN(targetUserId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const { status } = req.body;
            if (!status) {
                res.status(400).json({ success: false, message: 'Status is required' });
                return;
            }
            const result = await this.communityMemberService.updateMemberStatus({
                communityId, targetUserId, requesterId: req.user!.id, requesterRole: req.user!.role as UserRole, status,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async removeMember(req: Request, res: Response): Promise<void> {
        try {
            const communityId = parseInt(String(req.params.id));
            const targetUserId = parseInt(String(req.params.userId));
            if (isNaN(communityId) || isNaN(targetUserId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.communityMemberService.removeMember({
                communityId, targetUserId, requesterId: req.user!.id, requesterRole: req.user!.role as UserRole,
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