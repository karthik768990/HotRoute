import { DashboardStatus } from "../dashboard/dashboard.types"

export interface GetProjectsForUserInput{
    userId : string
}

export interface GetUserDashboardInput {
    userId: string
}

export interface ProjectOverview {
    projectId: string,
    projectName: string
    active: boolean
    status: DashboardStatus
    uptimePercentage: number
    averageResponseTime: number
    lastPingAt: Date | null

}

export interface RecentIncident {
    projectId: string
    projectName: string,

    statusCode: number
    errorMessage: string | null
    createdAt: Date
}


export interface BuildUserDashboardSummaryOutput {

    totalProjects: number
    activeProjects: number
    activeProjectsPercentage: number

    projectsUp: number
    projectsUpPercentage: number

    projectsDown: number
    projectsDownPercentage: number

    overallUptimePercentage: number
    averageResponseTime: number
}


export interface BuildUserDashboardSummaryInput {
    projectOverviews: ProjectOverview[]
}

export interface GetUserDashboardOutput {
    summary: BuildUserDashboardSummaryOutput

    recentIncidents: RecentIncident[]

    projects: ProjectOverview[]
}

// format for the percentages toFixed(2) for every percentage in the entire project 
