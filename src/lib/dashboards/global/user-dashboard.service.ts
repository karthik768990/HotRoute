import { GetUserDashboardInput, GetUserDashboardOutput } from "./user-dashboard.types";
import { getProjectOverviewsForUser } from "./helpers/user-dashboard.projects";
import { getRecentIncidents } from "./helpers/user-dashboard.incidents";
import { buildUserDashboardSummary } from "./helpers/user-dashboard.summary";
import { validateUser } from "../../projects/user.validation";

export async function getUserDashboard({ userId }: GetUserDashboardInput): Promise<GetUserDashboardOutput> {
    await validateUser(userId);

    const [projects, recentIncidents] = await Promise.all([
        getProjectOverviewsForUser(userId),
        getRecentIncidents(userId)
    ]);

    const summary = buildUserDashboardSummary({ projectOverviews: projects });

    return {
        summary,
        recentIncidents,
        projects
    };
}