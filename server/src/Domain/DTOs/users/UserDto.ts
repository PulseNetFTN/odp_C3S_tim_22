export class UserDto {
    public constructor(
        public id: number = 0,
        public username: string = '',
        public email: string = '',
        public firstName: string = '',
        public lastName: string = '',
        public bio: string | null = null,
        public profileImage: string | null = null,
        public role: string = 'user'
    ) {}
}

export class UserProfileDto {
    public constructor(
        public id: number = 0,
        public username: string = '',
        public email: string = '',
        public firstName: string = '',
        public lastName: string = '',
        public bio: string | null = null,
        public profileImage: string | null = null,
        public role: string = 'user',
        public createdAt: Date = new Date(),
        public stats: {
            postCount: number;
            commentCount: number;
            followerCount: number;
            followingCount: number;
        } = { postCount: 0, commentCount: 0, followerCount: 0, followingCount: 0 },
        public isFollowing: boolean = false
    ) {}
}