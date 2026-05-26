import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Database - Repositories
import { UserRepository } from './Database/repositories/users/UserRepository';
import { UserFollowRepository } from './Database/repositories/users/UserFollowRepository';
import { PostRepository } from './Database/repositories/posts/PostRepository';
import { PostLikeRepository } from './Database/repositories/posts/PostLikeRepository';
import { PostTagRepository } from './Database/repositories/posts/PostTagRepository';
import { PostCommentRepository } from './Database/repositories/posts/PostCommentRepository';
import { CommentReadWriteRepository } from './Database/repositories/comments/CommentReadWriteRepository';
import { CommentQueryRepository } from './Database/repositories/comments/CommentQueryRepository';
import { CommentLikeRepository } from './Database/repositories/comments/CommentLikeRepository';
import { CommunityRepository } from './Database/repositories/Community/CommunityRepository';
import { CommunityMemberRepository } from './Database/repositories/Community/CommunityMemberRepository';
import { TagRepository } from './Database/repositories/Tags/TagRepository';
import { AuditRepository } from './Database/repositories/audits/AuditRepository';

// Services
import { AuthService } from './Services/auth/AuthService';
import { UserService } from './Services/users/UserService';
import { PostService } from './Services/post/PostService';
import { CommentService } from './Services/comments/CommentService';
import { CommunityService } from './Services/Communities/CommunityService';
import { TagService } from './Services/Tags/TagService';
import { AuditService } from './Services/audit/AuditService';
import { CommunityMemberService } from './Services/Communities/CommunityMemberService';

// Controllers
import { AuthController } from './WebAPI/controllers/AuthController';
import { UserController } from './WebAPI/controllers/UserController';
import { PostController } from './WebAPI/controllers/PostController';
import { CommentController } from './WebAPI/controllers/CommentController';
import { CommunityController } from './WebAPI/controllers/CommunityController';
import { CommunityMemberController } from './WebAPI/controllers/CommunityMemberController';
import { TagsController } from './WebAPI/controllers/TagsController';
import { HealthController } from './WebAPI/controllers/HealthController';
import { AuditController } from './WebAPI/controllers/AuditController';

// Middleware
import { createAuditMiddleware } from './Middlewares/auditing/AuditMiddleware';

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
const postCommentRepository = new PostCommentRepository();
const commentReadWriteRepository = new CommentReadWriteRepository();
const commentQueryRepository = new CommentQueryRepository();
const commentLikeRepository = new CommentLikeRepository();
const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();
const communityMemberRepository = new CommunityMemberRepository();
const auditRepository = new AuditRepository();

// Services
const auditService = new AuditService(auditRepository);
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository, userFollowRepository, auditService, postRepository, commentReadWriteRepository);
const postService = new PostService(
    postRepository, postLikeRepository, postTagRepository, postCommentRepository,
    userRepository, userFollowRepository,
    communityRepository, communityMemberRepository,
    tagRepository
);
const communityMemberService = new CommunityMemberService(communityMemberRepository, auditService);
const commentService = new CommentService(
    commentReadWriteRepository, commentQueryRepository, commentLikeRepository,
    postRepository, communityMemberRepository, userRepository
);
const communityService = new CommunityService(communityRepository, communityMemberRepository, auditService);
const tagService = new TagService(tagRepository);

// Audit Middleware (pre kontrolera, posle parsera)
app.use(createAuditMiddleware(auditService));

// Controllers
const authController = new AuthController(authService, auditService);
const userController = new UserController(userService);
const postController = new PostController(postService);
const commentController = new CommentController(commentService);
const communityController = new CommunityController(communityService);
const tagController = new TagsController(tagService);
const healthController = new HealthController(auditService);
const auditController = new AuditController(auditService);
const communityMemberController = new CommunityMemberController(communityMemberService);

// Routes
app.use('/api/v1', authController.getRouter());
app.use('/api/v1', userController.getRouter());
app.use('/api/v1', postController.getRouter());
app.use('/api/v1', commentController.getRouter());
app.use('/api/v1', communityController.getRouter());
app.use('/api/v1', communityMemberController.getRouter());
app.use('/api/v1', tagController.getRouter());
app.use('/api/v1', healthController.getRouter());
app.use('/api/v1', auditController.getRouter());

// Start DB Health Check
const healthCheckInterval = parseInt(process.env.DB_HEALTH_INTERVAL_MS || '10000', 10);
startHealthCheck(healthCheckInterval);

export default app;