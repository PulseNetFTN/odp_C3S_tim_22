export class CommentDto {
    public constructor(
        public id: number = 0,
        public content: string = '',
        public postId: number = 0,
        public authorId: number = 0,
        public parentId: number | null = null,
        public isDeleted: boolean = false,
        public isFlagged: boolean = false,
        public replies: CommentDto[] = [],
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
        public username: string = '',
        public likesCount: number = 0,
        public isLiked: boolean = false
    ) {}
}