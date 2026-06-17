import { GetProjectDashboardOutput,GetProjectDashboardInput } from "./dashboard.types";
import { calculateUptimePercentage,calculateAverageResponseTime,getRecentFailures,getPingHistory } from "../core/analytics/analytics.service";
import { buildDashboardSummary,getRecentHistory } from "./helpers/dashboard.service.helper";


export async function getProjectDashboard({projectId}:GetProjectDashboardInput):Promise<GetProjectDashboardOutput>{
    const  [uptime,averageResponseTime,failures,history] = await Promise.all([calculateUptimePercentage({projectId}),calculateAverageResponseTime({projectId}),getRecentFailures({projectId}),getPingHistory({projectId})]);
    const recentHistory = getRecentHistory({history})
    const summary = buildDashboardSummary({uptimePercentage:uptime,averageResponseTime: averageResponseTime,recentHistory:recentHistory})
    return {
        summary : summary,
        recentFailures : failures,
        recentHistory: recentHistory
    }
}