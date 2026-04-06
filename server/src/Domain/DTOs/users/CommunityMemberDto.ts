import { CommunityRole } from "../../enums/CommunityRole";

export class CommunityMemberDto
{
    public constructor(
        public memberId: number = 0,
        public userId: number =0,
        public communityId: number =0,
        public status: 'active' | 'pending' | 'banned' = 'active',
        public role: CommunityRole = CommunityRole.Member,
        public joinedAt: Date | null = null
   
    )
    {}

}