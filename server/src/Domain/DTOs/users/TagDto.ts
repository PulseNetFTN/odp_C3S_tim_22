export class TagDto
{
    public constructor(
        public id: number = 0,
        public postid: number = 0,
        public name: string | null = null
    ){}
}