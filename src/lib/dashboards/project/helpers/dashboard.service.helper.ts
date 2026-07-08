import { PingLog } from "../../../../generated/prisma/browser";
import { BuildDashboardSummaryInput, BuildDashboardSummaryOutput, GetRecentHistoryInput } from "../dashboard.types";
import { DashboardStatus } from "../dashboard.types";


export function determineCurrentStatus(logs:PingLog[]):DashboardStatus{
    if(logs.length===0)return 'UNKNOWN'

    return logs[logs.length-1].success ? 'UP' : 'DOWN'
}

export  function getRecentHistory({history,limit}:GetRecentHistoryInput):PingLog[]{
    const actualLimit = limit??50
    if(history.length<=actualLimit)return history
    return history.slice(-1*actualLimit)
}

export function buildDashboardSummary({uptimePercentage,averageResponseTime,recentHistory}:BuildDashboardSummaryInput):BuildDashboardSummaryOutput{
    return {
        uptimePercentage: uptimePercentage,
        averageResponseTime: averageResponseTime,
        currentStatus: determineCurrentStatus(recentHistory)
    }
}
