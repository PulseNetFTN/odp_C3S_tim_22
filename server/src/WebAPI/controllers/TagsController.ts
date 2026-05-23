import { Request, Response, Router } from 'express';
import { IAuditService } from '../../Domain/services/audit/IAuditService';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';
import { sendServiceResult } from '../helpers/responseHelper';
import { PAGING } from '../../constants/paging'
import { ITagService } from '../../Domain/services/tags/ITagService';
import { User } from '../../Domain/models/User';

export class TagsController {
    private router: Router;
    private tagService: ITagService;

    constructor(tagService: ITagService) {
        this.router = Router();
        this.tagService = tagService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/tags', authenticate, this.getAllTags.bind(this));
        this.router.post('/tags/:id', authenticate, authorize(UserRole.Admin),this.updateTag.bind(this));
        this.router.delete('/tags/:id',authenticate,authorize(UserRole.Admin),this.deleteTag.bind(this));
    }


    private async getAllTags(req: Request, res: Response): Promise<void>{
    try {
            const result = await this.tagService.getAllTags();
            sendServiceResult(res,result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    private async updateTag(req: Request, res: Response): Promise<void>{

         try {
            const id = parseInt(String(req.params.id));
            const { name } = req.body;
            if (isNaN(id) || !Object.values(String).includes(name)) {
                res.status(400).json({ success: false, message: 'Invalid data' });
                return;
            }
            const result = await this.tagService.updateTag({ id: id, name });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }

    }
    private async deleteTag(req: Request, res: Response): Promise<void>{
 try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.tagService.deleteTag({id:id});
            sendServiceResult(res,result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}