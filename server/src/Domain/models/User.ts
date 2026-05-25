export class User {
    public constructor(
        public id: number = 0,
        public username: string = '',
        public email: string = '',
        public firstName: string = '',
        public lastName: string = '',
        public bio: string | null = null,
        public profileImage: string | null = null,
        public role: string = 'user',
        public passwordHash: string = '',
        public createdAt: Date | null = null
    ) {}
}


