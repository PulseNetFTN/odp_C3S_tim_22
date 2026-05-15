export class Audit {
    public constructor(
        public id: number = 0,
        public userId: number | null = null,
        public action: string = '',
        public entityType: string = '',
        public entityId: number | null = null,
        public details: string | null = null,
        public ipAddress: string | null = null,
        public userAgent: string | null = null,
        public createdAt: Date | null = null
    ) {}
}
 