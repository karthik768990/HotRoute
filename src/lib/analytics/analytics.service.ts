import prisma from "../prisma";
import { getProjectByIdInternal } from "../projects/project.service";
import { PingLog, Project } from "../../generated/prisma/browser";
import { CalculateAverageResponseTimeInput, CalculateUptimePercentageInput, GetPingHistoryInput, GetRecentFailuresInput } from "./analytics.types";

//helpers 
export async function getPingLogForProject(projectId: string): Promise<PingLog[]> {
    return await prisma.pingLog.findMany({
        where: { projectId }
    });
}

async function getProjectOrThrow(projectId: string, skipValidation?: boolean) {
    if (!skipValidation) {
        await getProjectByIdInternal(projectId);
    }
}

//actual module 

export async function calculateUptimePercentage({ projectId, skipValidation }: CalculateUptimePercentageInput): Promise<number> {
    await getProjectOrThrow(projectId, skipValidation);

    const allLogsSize = await prisma.pingLog.count({ where: { projectId } });

    if (allLogsSize === 0) return 0;
    
    const successfulLogSize = await prisma.pingLog.count({ where: { projectId, success: true } });

    return Number(((successfulLogSize / allLogsSize) * 100).toFixed(2));
}


export async function calculateAverageResponseTime({ projectId, skipValidation }: CalculateAverageResponseTimeInput): Promise<number> {
    await getProjectOrThrow(projectId, skipValidation);

    const avgResponseTime = await prisma.pingLog.aggregate({
        where: {
            projectId: projectId,
            success: true
        },
        _avg: {
            responseTime: true,
        },
    });
    
    if (avgResponseTime._avg.responseTime === null) return 0;
    return Number(avgResponseTime._avg.responseTime);
}

export async function getRecentFailures({ projectId, skipValidation }: GetRecentFailuresInput): Promise<PingLog[]> {
    await getProjectOrThrow(projectId, skipValidation);

    const failedPingLogs = await prisma.pingLog.findMany({
        where: {
            projectId: projectId,
            success: false
        },
        orderBy: { createdAt: 'desc' }, 
        take: 10
    });

    return failedPingLogs;
}

export async function getPingHistory({ projectId, skipValidation }: GetPingHistoryInput): Promise<PingLog[]> {
    await getProjectOrThrow(projectId, skipValidation);

    const recentLogs = await prisma.pingLog.findMany({
        where: { projectId: projectId }, 
        orderBy: { createdAt: 'desc' },
        take: 50
    });
    
    return recentLogs.reverse();
}

export async function getGlobalRecentFailures(userId: string): Promise<(PingLog & { project: Project })[]> {
    const failedLogs = await prisma.pingLog.findMany({
        where: {
            success: false,
            project: {
                userId: userId
            }
        },
        include: {
            project: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    return failedLogs;
}