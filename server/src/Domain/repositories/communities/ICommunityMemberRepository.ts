import { CommunityMember } from '../../models/CommunityMember';
import { CommunityRole } from '../../enums/CommunityRole';
import { RepositoryResult } from '../../types/RepositoryResult';

export interface ICommunityMemberRepository {
    getMemberCount(communityId: number): Promise<number>;
    getMemberCountBatch(communityIds: number[]): Promise<Map<number, number>>;
    getMember(userId: number, communityId: number): Promise<RepositoryResult<CommunityMember>>;
    getMembers(communityId: number): Promise<CommunityMember[]>;
    getMemberUserIds(communityId: number): Promise<number[]>;
    addMember(userId: number, communityId: number, role: CommunityRole, status: string): Promise<boolean>;
    updateMemberRole(userId: number, communityId: number, role: CommunityRole): Promise<boolean>;
    updateMemberStatus(userId: number, communityId: number, status: string): Promise<boolean>;
    removeMember(userId: number, communityId: number): Promise<boolean>;
}
