import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 20,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const likeLimiter = rateLimit({
    windowMs: 60 * 1000,        // 1 minute
    max: 60,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});