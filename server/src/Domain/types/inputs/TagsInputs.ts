export type CreateTagInput = {
    name: string;
};
export type GetByIdTagInput = {
    id: number;
};
export type DeleteTagInput = {
    id: number;
};

export type UpdateTagInput = {
    id: number;
    name: string;
}