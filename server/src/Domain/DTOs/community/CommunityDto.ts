import { CommunityType } from "../../enums/CommunityType";

export class CommunityDto
{
    public constructor (
        public id: number = 0,
        public communityName: string = '',
        public description: string | null = null,
        public rules: string | null = null,
        public communityType: CommunityType = CommunityType.Public,
        public icon: string | null = null,
        public creatorId: number = 0,
        public membercount: number = 0,
        public createdAt: Date | null = null


    ){}
}