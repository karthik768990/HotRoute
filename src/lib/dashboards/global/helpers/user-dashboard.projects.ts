import { listProjects } from "../../../projects/project.service";
import { Project } from "../../../../generated/prisma/browser";
import { GetProjectsForUserInput, ProjectOverview } from "../user-dashboard.types";
import { calculateUptimePercentage, calculateAverageResponseTime, getPingHistory } from "../../../analytics/analytics.service";
import { determineCurrentStatus } from "../../project/helpers/dashboard.service.helper";


export async function getProjectsForUser({userId}:GetProjectsForUserInput):Promise<Project[]>{
    return await listProjects({ userId });
}

export async function buildProjectOverview(projects: Project[]): Promise<ProjectOverview[]> {
    return Promise.all(
        projects.map(async (project) => {
            const [uptimePercentage, averageResponseTime, pingHistory] = await Promise.all([
                calculateUptimePercentage({ projectId: project.id, skipValidation: true }),
                calculateAverageResponseTime({ projectId: project.id, skipValidation: true }),
                getPingHistory({ projectId: project.id, skipValidation: true })
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