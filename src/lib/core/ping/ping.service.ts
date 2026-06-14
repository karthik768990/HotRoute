import prisma from "../../prisma"
import { ProjectNotFoundError } from "../projects/helpers/project.errors";
import { createPingLog, executePing,updateProjectLastPing } from "./helpers/ping.helper";
import { PerformPingInput, PerformPingOutput } from "./ping.types";


export async function performPing({projectId}:PerformPingInput):Promise<PerformPingOutput | null>{
    const project  = await prisma.project.findUnique({
        where:{
            id:projectId
        }
    })

    if(!project)throw new ProjectNotFoundError("Project not found ")

    if(!project.active) return null
    const pingResult = await executePing({
        url:project.url
    })

    const createdPingLog = await createPingLog({
        projectId:project.id,
        statusCode:pingResult.statusCode,
        responseTime:pingResult.responseTime,
        success:pingResult.success,
        errorMessage:pingResult.errorMessage
    })


    await updateProjectLastPing(project.id)
    return {
        projectId:project.id,
        statusCode:pingResult.statusCode,
        responseTime: pingResult.responseTime,
        success:pingResult.success,
        errorMessage:pingResult.errorMessage,
        createdAt:   createdPingLog.createdAt
    }

}