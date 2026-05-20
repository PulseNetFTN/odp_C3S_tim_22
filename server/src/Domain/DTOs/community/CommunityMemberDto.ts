import { CommunityRole } from "../../enums/CommunityRole";

export class CommunityMemberDto
{
    public constructor(
        public userId: number =0,
        public communityId: number =0,
        public status: 'active' | 'pending' | 'banned' = 'active',
        public role: 'member'|'moderator' = 'member',
        public joinedAt: Date | null = null
   
    ){}

}