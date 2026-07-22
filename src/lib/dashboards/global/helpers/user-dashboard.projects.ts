import prisma from "../../../prisma";
import { ProjectOverview } from "../user-dashboard.types";

export async function getProjectOverviewsForUser(userId: string): Promise<ProjectOverview[]> {
    const rawOverviews = await prisma.$queryRaw<
        Array<{
            projectId: string;
            projectName: string;
            active: boolean;
            status: 'UP' | 'DOWN' | 'UNKNOWN';
            uptimePercentage: number;
            averageResponseTime: number;
            lastPingAt: Date | null;
        }>
    >`
        SELECT 
            p.id AS "projectId",
            p.name AS "projectName",
            p.active AS "active",
            COALESCE(latest_log.status, 'UNKNOWN') AS "status",
            COALESCE(
                ROUND(
                    (COUNT(pl.id) FILTER (WHERE pl.success = true)::numeric / NULLIF(COUNT(pl.id), 0)::numeric) * 100, 
                    2
                )::float, 
                0
            ) AS "uptimePercentage",
            COALESCE(
                ROUND(
                    AVG(pl."responseTime") FILTER (WHERE pl.success = true)::numeric, 
                    2
                )::float, 
                0
            ) AS "averageResponseTime",
            COALESCE(latest_log."createdAt", p."lastPingAt") AS "lastPingAt"
        FROM "Project" p
        LEFT JOIN "PingLog" pl ON pl."projectId" = p.id
        LEFT JOIN LATERAL (
            SELECT 
                CASE WHEN success THEN 'UP' ELSE 'DOWN' END AS status,
                "createdAt"
            FROM "PingLog"
            WHERE "projectId" = p.id
            ORDER BY "createdAt" DESC
            LIMIT 1
        ) latest_log ON true
        WHERE p."userId" = ${userId}
        GROUP BY p.id, p.name, p.active, p."createdAt", latest_log.status, latest_log."createdAt", p."lastPingAt"
        ORDER BY p."createdAt" DESC;
    `;

    return rawOverviews;
}