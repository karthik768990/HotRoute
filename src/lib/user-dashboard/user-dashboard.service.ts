import { GetUserDashboardInput, GetUserDashboardOutput } from "./user-dashboard.types";
import { getProjectsForUser, buildProjectOverview } from "./helpers/user-dashboard.projects";
import { getRecentIncidents } from "./helpers/user-dashboard.incidents";
import { buildUserDashboardSummary } from "./helpers/user-dashboard.summary";

export async function getUserDashboard({ userId }: GetUserDashboardInput): Promise<GetUserDashboardOutput> {
    const rawProjects = await getProjectsForUser({ userId });

    const [projects, recentIncidents] = await Promise.all([
        buildProjectOverview(rawProjects),
        getRecentIncidents(userId)
    ]);

    const summary = buildUserDashboardSummary({ projectOverviews: projects });

    return {
        summary,
        recentIncidents,
        projects
    };
}