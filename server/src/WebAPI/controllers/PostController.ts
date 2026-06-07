import { Request, Response, Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { validateCreatePost } from '../validators/PostValidator';
import { IPostService } from '../../Domain/services/post/IPostService';
import { sendServiceResult } from '../helpers/responseHelper';

export class PostController {
    private router: Router;
    private postService: IPostService;

    constructor(postService: IPostService) {
        this.router = Router();
        this.postService = postService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/posts/public', optionalAuthenticate, this.getPublicPosts.bind(this));
        this.router.get('/posts/feed', authenticate, this.getFeed.bind(this));
        this.router.get('/posts/community/:communityId', optionalAuthenticate, this.getByCommunity.bind(this));
        this.router.get('/posts/:id', optionalAuthenticate, this.getById.bind(this));
        this.router.post('/posts', authenticate, this.create.bind(this));
        this.router.put('/posts/:id', authenticate, this.update.bind(this));
        this.router.delete('/posts/:id', authenticate, this.delete.bind(this));
        this.router.post('/posts/:id/like', authenticate, this.addLike.bind(this));
        this.router.delete('/posts/:id/like', authenticate, this.removeLike.bind(this));
        this.router.post('/posts/:id/tags', authenticate, this.addTag.bind(this));
        this.router.delete('/posts/:id/tags/:tagId', authenticate, this.removeTag.bind(this));
        this.router.get('/posts/user/:userId', optionalAuthenticate, this.getPostsByUser.bind(this));
    }

    private async getPostsByUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(String(req.params.userId));
            if (isNaN(userId)) {
                res.status(400).json({ success: false, message: 'Invalid user ID' });
                return;
            }
            const requesterId = req.user?.id ?? null;
            const result = await this.postService.getPostsByUser({ userId, requesterId });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }


    private async getPublicPosts(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(String(req.query.limit)) || 50;
            if (limit < 1 || limit > 100) {
                res.status(400).json({ success: false, message: 'Limit must be between 1 and 100' });
                return;
            }
            const result = await this.postService.getPublicPosts({
                limit,
                requesterId: req.user?.id ?? null,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getByCommunity(req: Request, res: Response): Promise<void> {
        try {
            const communityId = parseInt(String(req.params.communityId));
            if (isNaN(communityId)) {
                res.status(400).json({ success: false, message: 'Invalid community ID' });
                return;
            }
            const sort = req.query.sort as string;
            const validSort = ['newest', 'popular', 'commented'].includes(sort)
                ? sort as 'newest' | 'popular' | 'commented'
                : 'newest';

            const result = await this.postService.getCommunityPosts({
                communityId,
                sort: validSort,
                requesterId: req.user?.id ?? null,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getFeed(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.postService.getFeed({ userId: req.user!.id });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async create(req: Request, res: Response): Promise<void> {
        try {
            const { title, content, mediaUrl, communityId, tagIds } = req.body;

            const validation = validateCreatePost(title, content);
            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            if (!communityId || isNaN(Number(communityId))) {
                res.status(400).json({ success: false, message: 'Valid community ID is required' });
                return;
            }

            const result = await this.postService.createPost({
                title,
                content,
                mediaUrl: mediaUrl ?? null,
                communityId: Number(communityId),
                authorId: req.user!.id,
                tagIds: Array.isArray(tagIds) ? tagIds : [],
            });
            sendServiceResult(res, result, 201);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.getPostById({
                postId: id,
                requesterId: req.user?.id ?? null,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const { title, content, mediaUrl } = req.body;
            const validation = validateCreatePost(title, content);
            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }
            const result = await this.postService.updatePost({
                postId: id,
                requesterId: req.user!.id,
                requesterRole: req.user!.role,
                title,
                content,
                mediaUrl: mediaUrl ?? null,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.deletePost({
                postId: id,
                requesterId: req.user!.id,
                requesterRole: req.user!.role,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async addLike(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(String(req.params.id));
            if (isNaN(postId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.likePost({
                userId: req.user!.id,
                postId,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async removeLike(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(String(req.params.id));
            if (isNaN(postId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.unlikePost({
                userId: req.user!.id,
                postId,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async addTag(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(String(req.params.id));
            const tagId = parseInt(String(req.body.tagId));
            if (isNaN(postId) || isNaN(tagId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.addTag({
                postId,
                tagId,
                requesterId: req.user!.id,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async removeTag(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(String(req.params.id));
            const tagId = parseInt(String(req.params.tagId));
            if (isNaN(postId) || isNaN(tagId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.removeTag({
                postId,
                tagId,
                requesterId: req.user!.id,
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