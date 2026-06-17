import prisma from "../../prisma";
import { ProjectNotFoundError } from "../projects/helpers/project.errors";
import { PingLog } from "../../../generated/prisma/browser";
import { CalculateAverageResponseTimeInput, CalculateUptimePercentageInput, GetPingHistoryInput, GetRecentFailuresInput } from "./analytics.types";

//helpers 
export async function getPingLogForProject(projectId: string): Promise<PingLog[]> {
    return await prisma.pingLog.findMany({
        where: {
            projectId: projectId
        }
    })
}

async function getProjectOrThrow(projectId: string) {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId
        }
    })
    if (!project) {
        throw new ProjectNotFoundError("Project not found ")
    }
}

//actual module 

export async function calculateUptimePercentage({ projectId }: CalculateUptimePercentageInput): Promise<number> {
    await getProjectOrThrow(projectId)

    const allLogs = await getPingLogForProject(projectId);
    const allLogsSize = allLogs.length
    if (allLogsSize === 0) return 0
    const successfulLogs = allLogs.filter(log => log.success)
    const successfulLogSize = successfulLogs.length
    return Number(((successfulLogSize / allLogsSize) * 100).toFixed(2))
}


export async function calculateAverageResponseTime({ projectId }: CalculateAverageResponseTimeInput): Promise<number> {
    await getProjectOrThrow(projectId)

    const avgResponseTime = await prisma.pingLog.aggregate({
        where: {
            projectId: projectId,
            success: true
        },
        _avg: {
            responseTime: true,
        },
    })
    if (avgResponseTime._avg.responseTime === null) return 0;
    return (Number)(avgResponseTime._avg.responseTime)
}

export async function getRecentFailures({ projectId }: GetRecentFailuresInput): Promise<PingLog[]> {
    await getProjectOrThrow(projectId)


    const failedPingLogs = await prisma.pingLog.findMany({
        where: {
            projectId: projectId,
            success: false
        },
        orderBy: { createdAt: 'desc' }, take: 10
    })

    return failedPingLogs
}

export async function getPingHistory({ projectId }: GetPingHistoryInput): Promise<PingLog[]> {
    await getProjectOrThrow(projectId)

    const allPingLogs = await prisma.pingLog.findMany({

        where: { projectId: projectId }, orderBy: { createdAt: 'asc' }
    })
    return allPingLogs
}   