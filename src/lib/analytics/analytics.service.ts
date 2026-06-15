import { CalculateUptimePercentageInput } from "./analytics.service.test";
import prisma from "../prisma";
import { ProjectNotFoundError } from "../core/projects/helpers/project.errors";
import { PingLog } from "../../generated/prisma/browser";

//helpers 
export async function getPingLogForProject(projectId: string): Promise<PingLog[]> {
    return await prisma.pingLog.findMany({
        where: {
            projectId: projectId
        }
    })
}


//actual module 

export async function calculateUptimePercentage({ projectId }: CalculateUptimePercentageInput): Promise<number> {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId
        }
    })
    if (!project) {
        throw new ProjectNotFoundError("Project not found ")
    }

    const allLogs = await getPingLogForProject(projectId);
    const allLogsSize  =allLogs.length
    if(allLogsSize===0)return 0
    const successfulLogs = allLogs.filter(log=>log.success)
    const successfulLogSize = successfulLogs.length
    return Number(((successfulLogSize/allLogsSize)*100).toFixed(2))
}