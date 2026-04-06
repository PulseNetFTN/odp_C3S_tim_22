import { asyncWrapProviders } from "node:async_hooks";
import { ApprovedStatus } from "../enums/ApprovedStatus";
import { CommunityRole } from "../enums/CommunityRole";

export class CommunityMember
{
    public constructor(
        memberId: number = 0,
        userId: number =0,
        communityId: number =0,
        approved: ApprovedStatus = ApprovedStatus.NotApproved,
        role: CommunityRole = CommunityRole.Member,
        joinedAt: Date | null = null
    )
    {}

}