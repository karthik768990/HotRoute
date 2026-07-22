import prisma from "../../../prisma";
import { RecentIncident } from "../user-dashboard.types";

export async function getRecentIncidents(userId: string): Promise<RecentIncident[]> {
    const failedLogs = await prisma.pingLog.findMany({
        where: {
            success: false,
            project: {
                userId: userId
            }
        },
        select: {
            projectId: true,
            statusCode: true,
            errorMessage: true,
            createdAt: true,
            project: {
                select: {
                    name: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    return failedLogs.map(log => ({
        projectId: log.projectId,
        projectName: log.project.name,
        statusCode: log.statusCode ?? 500,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt
    }));
}