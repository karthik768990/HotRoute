export interface PerformPingInput{
    projectId:string
}

export interface PerformPingOutput{
    projectId :string,
    statusCode: number| null
    responseTime: number  // this is in ms 
    success: boolean 
    errorMessage: string| null 

    createdAt: Date 
}

