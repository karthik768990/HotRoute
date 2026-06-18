import prisma from "../../prisma";
import { Project } from "../../../generated/prisma/browser";
import { GetProjectsForUserInput, ProjectOverview } from "../user-dashboard.types";
import { calculateUptimePercentage, calculateAverageResponseTime, getPingHistory } from "../../core/analytics/analytics.service";
import { determineCurrentStatus } from "../../dashboard/helpers/dashboard.service.helper";


export async function getProjectsForUser({userId}:GetProjectsForUserInput):Promise<Project[]>{
    const projects = await prisma.project.findMany({
        where:{userId: userId}
    })
    return projects
}

export async function buildProjectOverview(projects: Project[]): Promise<ProjectOverview[]> {
    return Promise.all(
        projects.map(async (project) => {
            const [uptimePercentage, averageResponseTime, pingHistory] = await Promise.all([
                calculateUptimePercentage({ projectId: project.id }),
                calculateAverageResponseTime({ projectId: project.id }),
                getPingHistory({ projectId: project.id })
            ]);

            const status = determineCurrentStatus(pingHistory);
            const lastPingAt = pingHistory.length > 0 ? pingHistory[0].createdAt : null;

            return {
                projectId: project.id,
                projectName: project.name,
                active: project.active,
                status,
                uptimePercentage,
                averageResponseTime,
                lastPingAt
            };
        })
    );
}