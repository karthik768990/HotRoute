import { PingLog } from "../../generated/prisma/browser"


export type DashboardStatus = 'UP' | 'DOWN' | 'UNKNOWN'

export interface GetProjectDashboardInput{
    projectId: string
}

export interface GetProjectDashboardOutput{
    summary: BuildDashboardSummaryOutput
    recentFailures: PingLog[],
    recentHistory: PingLog[]   
}


export interface GetRecentHistoryInput{
    history: PingLog[]
    limit?: number
}

export interface BuildDashboardSummaryInput{
    uptimePercentage: number,
    averageResponseTime: number,
    recentHistory: PingLog[]
}

export interface BuildDashboardSummaryOutput{
    uptimePercentage: number
    averageResponseTime: number
    currentStatus : DashboardStatus
}