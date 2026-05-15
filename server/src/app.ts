import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Database - Repositories
import { UserRepository } from './Database/repositories/users/UserRepository';
import { UserFollowRepository } from './Database/repositories/users/UserFollowRepository';
import { PostRepository } from './Database/repositories/posts/PostRepository';
import { PostLikeRepository } from './Database/repositories/posts/PostLikeRepository';
import { PostTagRepository } from './Database/repositories/posts/PostTagRepository';
import { CommentReadWriteRepository } from './Database/repositories/comments/CommentReadWriteRepository';
import { CommentQueryRepository } from './Database/repositories/comments/CommentQueryRepository';
import { CommentLikeRepository } from './Database/repositories/comments/CommentLikeRepository';
import { CommunityRepository } from './Database/repositories/communities/CommunityRepository';
import { TagRepository } from './Database/repositories/tags/TagRepository';
import { AuditRepository } from './Database/repositories/audits/AuditRepository';

// Services
import { AuthService } from './Services/auth/AuthService';
import { UserService } from './Services/users/UserService';
import { PostService } from './Services/posts/PostService';
import { CommentService } from './Services/comments/CommentService';
import { CommunityService } from './Services/communities/CommunityService';
import { TagService } from './Services/tags/TagService';
import { AuditService } from './Services/audits/AuditService';

// Controllers
import { AuthController } from './WebAPI/controllers/AuthController';
import { UserController } from './WebAPI/controllers/UserController';
import { PostController } from './WebAPI/controllers/PostController';
import { CommentController } from './WebAPI/controllers/CommentController';
import { CommunityController } from './WebAPI/controllers/CommunityController';
import { TagController } from './WebAPI/controllers/TagController';
import { HealthController } from './WebAPI/controllers/HealthController';
import { AuditController } from './WebAPI/controllers/AuditController';

// Middleware
import { createAuditMiddleware } from './Middlewares/audit/AuditMiddleware';

// Database Health Check
import { startHealthCheck } from './Database/connection/DbConnectionPool';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Repositories
const userRepository = new UserRepository();
const userFollowRepository = new UserFollowRepository();
const postRepository = new PostRepository();
const postLikeRepository = new PostLikeRepository();
const postTagRepository = new PostTagRepository();
const commentReadWriteRepository = new CommentReadWriteRepository();
const commentQueryRepository = new CommentQueryRepository();
const commentLikeRepository = new CommentLikeRepository();
const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();
const auditRepository = new AuditRepository();

// Services
const auditService = new AuditService(auditRepository);
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository, userFollowRepository, auditService);
const postService = new PostService(
    postRepository, postLikeRepository, postTagRepository,
    userRepository, userFollowRepository,
    communityRepository, tagRepository
);
const commentService = new CommentService(
    commentReadWriteRepository, commentQueryRepository, commentLikeRepository,
    postRepository, communityRepository
);
const communityService = new CommunityService(communityRepository, userRepository, auditService);
const tagService = new TagService(tagRepository);

// Audit Middleware (pre kontrolera, posle parsera)
app.use(createAuditMiddleware(auditService));

// Controllers
const authController = new AuthController(authService, auditService);
const userController = new UserController(userService);
const postController = new PostController(postService);
const commentController = new CommentController(commentService);
const communityController = new CommunityController(communityService);
const tagController = new TagController(tagService);
const healthController = new HealthController();
const auditController = new AuditController(auditService);

// Routes
app.use('/api/v1', authController.getRouter());
app.use('/api/v1', userController.getRouter());
app.use('/api/v1', postController.getRouter());
app.use('/api/v1', commentController.getRouter());
app.use('/api/v1', communityController.getRouter());
app.use('/api/v1', tagController.getRouter());
app.use('/api/v1', healthController.getRouter());
app.use('/api/v1', auditController.getRouter());

// Start DB Health Check
const healthCheckInterval = parseInt(process.env.DB_HEALTH_INTERVAL_MS || '10000', 10);
startHealthCheck(healthCheckInterval);

export default app;