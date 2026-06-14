export interface CreateProjectInput{
    userId: string,
    name:string,
    url: string,
    interval:number
}


export interface UpdateProjectInput{
    projectId: string,
    userId: string 
    name?: string,
    url?: string,
    interval?: number,
    active?: boolean
}


export interface GetProjectByIdInput{
    userId:string,
    projectId:string
}

export interface ListProjectsInput{
    userId:string
}

export interface DeleteProjectInput{
    userId:string,
    projectId:string
}
