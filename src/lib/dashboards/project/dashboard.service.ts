import { GetProjectDashboardOutput,GetProjectDashboardInput } from "./dashboard.types";
import { calculateUptimePercentage,calculateAverageResponseTime,getRecentFailures,getPingHistory } from "../../analytics/analytics.service";
import { buildDashboardSummary,getRecentHistory } from "./helpers/dashboard.service.helper";
import { getProjectByIdInternal } from "../../projects/project.service";


export async function getProjectDashboard({projectId}:GetProjectDashboardInput):Promise<GetProjectDashboardOutput>{
    await getProjectByIdInternal(projectId);
    
    const [uptime, averageResponseTime, failures, history] = await Promise.all([
        calculateUptimePercentage({ projectId, skipValidation: true }),
        calculateAverageResponseTime({ projectId, skipValidation: true }),
        getRecentFailures({ projectId, skipValidation: true }),
        getPingHistory({ projectId, skipValidation: true })
    ]);
    const recentHistory = getRecentHistory({history})
    const summary = buildDashboardSummary({uptimePercentage:uptime,averageResponseTime: averageResponseTime,recentHistory:recentHistory})
    return {
        summary : summary,
        recentFailures : failures,
        recentHistory: recentHistory
    }
}