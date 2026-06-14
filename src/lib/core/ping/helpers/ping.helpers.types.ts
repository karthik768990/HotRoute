export interface ExecutePingInput{
    url:string
}


export interface ExecutePingOutput{
    statusCode: number |null 

    responseTime: number;
    success: boolean
    errorMessage: string| null
}

export interface CreatePingLogInput{
    projectId: string,
    statusCode: number| null,
    responseTime: number
    success: boolean
    errorMessage: string| null
}
