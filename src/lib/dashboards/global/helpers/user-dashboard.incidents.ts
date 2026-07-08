import { getGlobalRecentFailures } from "../../../analytics/analytics.service";
import { RecentIncident } from "../user-dashboard.types";

export async function getRecentIncidents(userId: string): Promise<RecentIncident[]> {
    const failedLogs = await getGlobalRecentFailures(userId);

    return failedLogs.map(log => ({
        projectId: log.projectId,
        projectName: log.project.name,
        statusCode: log.statusCode ?? 500,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt
    }));
}