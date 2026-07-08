import { BuildUserDashboardSummaryInput, BuildUserDashboardSummaryOutput } from "../user-dashboard.types";


export function buildUserDashboardSummary(
    { projectOverviews }: BuildUserDashboardSummaryInput
): BuildUserDashboardSummaryOutput {
    const totalProjects = projectOverviews.length;

    if (totalProjects === 0) {
        return {
            totalProjects: 0,
            activeProjects: 0,
            activeProjectsPercentage: 0,
            projectsUp: 0,
            projectsUpPercentage: 0,
            projectsDown: 0,
            projectsDownPercentage: 0,
            overallUptimePercentage: 0,
            averageResponseTime: 0
        };
    }
    const activeProjects = projectOverviews.filter(p => p.active).length;
    const projectsUp = projectOverviews.filter(p => p.status === 'UP').length;
    const projectsDown = projectOverviews.filter(p => p.status === 'DOWN').length;

    const activeProjectsPercentage = (activeProjects / totalProjects) * 100;
    const projectsUpPercentage = (projectsUp / totalProjects) * 100;
    const projectsDownPercentage = (projectsDown / totalProjects) * 100;

    const totalUptime = projectOverviews.reduce((sum, p) => sum + p.uptimePercentage, 0);
    const overallUptimePercentage = totalUptime / totalProjects;

    // For average response time, we should only consider projects that have a > 0 response time
    // If a project has 0 response time, it usually means it has no successful pings.
    const projectsWithValidResponseTime = projectOverviews.filter(p => p.averageResponseTime > 0);
    const totalResponseTime = projectsWithValidResponseTime.reduce((sum, p) => sum + p.averageResponseTime, 0);
    const averageResponseTime = projectsWithValidResponseTime.length > 0
        ? totalResponseTime / projectsWithValidResponseTime.length
        : 0;

    return {
        totalProjects,
        activeProjects,
        activeProjectsPercentage: Number(activeProjectsPercentage.toFixed(2)),
        projectsUp,
        projectsUpPercentage: Number(projectsUpPercentage.toFixed(2)),
        projectsDown,
        projectsDownPercentage: Number(projectsDownPercentage.toFixed(2)),
        overallUptimePercentage: Number(overallUptimePercentage.toFixed(2)),
        averageResponseTime: Number(averageResponseTime.toFixed(2))
    };
}
