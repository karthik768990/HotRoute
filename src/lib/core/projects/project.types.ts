export interface CreateProjectInput{
    userId: string,
    name:string,
    url: string,
    interval:number
}


export interface UpdateProjectInput{
    name?: string,
    url?: string,
    interval?: number,
    active?: boolean
}

