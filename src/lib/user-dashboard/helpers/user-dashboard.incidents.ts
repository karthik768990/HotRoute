import { PingLog } from "../../../generated/prisma/browser";
import { UnauthorizedProjectAccessError } from "../../core/projects/helpers/project.errors";
import prisma from "../../prisma";
import { getProjectsForUser } from "./user-dashboard.projects";
import { RecentIncident } from "../user-dashboard.types";

export async function getRecentIncidents(userId: string): Promise<RecentIncident[]> {
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

    return failedLogs.map(log => ({
        projectId: log.projectId,
        projectName: log.project.name,
        statusCode: log.statusCode ?? 500,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt
    }));
}