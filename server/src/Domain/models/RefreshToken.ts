export class RefreshToken {
    constructor(
        public readonly id: number,
        public readonly userId: number,
        public readonly tokenHash: string,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
    ) {}
}