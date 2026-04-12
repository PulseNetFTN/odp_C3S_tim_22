import { asyncWrapProviders } from "node:async_hooks";
import { CommunityRole } from "../enums/CommunityRole";

export class CommunityMember
{
    public constructor(
        
        public userId: number = 0,
        public communityId: number =0,
        public status: 'active' | 'pending' | 'banned' = 'active',
        public role: 'moderator'|'member' = 'member',
        public joinedAt: Date | null = null
   
    ){}

}