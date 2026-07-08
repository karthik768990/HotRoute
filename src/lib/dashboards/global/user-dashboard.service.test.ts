import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import prisma from "../../prisma";
import { Project, User } from "../../../generated/prisma/browser";
import { getUserDashboard } from "./user-dashboard.service";


vi.setConfig({ hookTimeout: 30000, testTimeout: 30000 });

let testUser: User;
let upProject: Project;
let downProject: Project;
let inactiveProject: Project;

describe("User Dashboard Service", () => {
    beforeAll(async () => {
        testUser = await prisma.user.create({
            data: {
                username: "User Dashboard Test",
                email: `user-dashboard-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: new Date()
            }
        });

        upProject = await prisma.project.create({
            data: {
                userId: testUser.id,
                name: "Up Project",
                url: "https://up.com",
                interval: 5,
                active: true
            }
        });

        downProject = await prisma.project.create({
            data: {
                userId: testUser.id,
                name: "Down Project",
                url: "https://down.com",
                interval: 5,
                active: true
            }
        });

        inactiveProject = await prisma.project.create({
            data: {
                userId: testUser.id,
                name: "Inactive Project",
                url: "https://inactive.com",
                interval: 5,
                active: false
            }
        });

        // Add 2 successful logs for UP project
        await prisma.pingLog.createMany({
            data: [
                { projectId: upProject.id, success: true, responseTime: 100, statusCode: 200, createdAt: new Date(Date.now() - 10000) },
                { projectId: upProject.id, success: true, responseTime: 150, statusCode: 200, createdAt: new Date() }
            ]
        });

        // Add 2 failed logs for DOWN project
        await prisma.pingLog.createMany({
            data: [
                { projectId: downProject.id, success: false, responseTime: 0, statusCode: 500, createdAt: new Date(Date.now() - 10000) },
                { projectId: downProject.id, success: false, responseTime: 0, statusCode: 500, createdAt: new Date() }
            ]
        });
    });

    afterAll(async () => {
        await prisma.pingLog.deleteMany({
            where: {
                projectId: { in: [upProject.id, downProject.id, inactiveProject.id] }
            }
        });

        await prisma.project.deleteMany({
            where: {
                id: { in: [upProject.id, downProject.id, inactiveProject.id] }
            }
        });

        await prisma.user.delete({ where: { id: testUser.id } });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should return empty dashboard for user with no projects", async () => {
        const emptyUser = await prisma.user.create({
            data: {
                username: "Empty User",
                email: `empty-${Date.now()}@test.com`,
                password: "hashed",
                verifiedAt: new Date()
            }
        });


        const dashboard = await getUserDashboard({ userId: emptyUser.id });

        expect(dashboard.projects).toHaveLength(0);
        expect(dashboard.recentIncidents).toHaveLength(0);
        
        expect(dashboard.summary).toEqual({
            totalProjects: 0,
            activeProjects: 0,
            activeProjectsPercentage: 0,
            projectsUp: 0,
            projectsUpPercentage: 0,
            projectsDown: 0,
            projectsDownPercentage: 0,
            overallUptimePercentage: 0,
            averageResponseTime: 0
        });

        await prisma.user.delete({ where: { id: emptyUser.id } });
    });

    it("should calculate summary correctly for multiple projects", async () => {
        const dashboard = await getUserDashboard({ userId: testUser.id });

        expect(dashboard.projects).toHaveLength(3);
        
        expect(dashboard.summary.totalProjects).toBe(3);
        expect(dashboard.summary.activeProjects).toBe(2);
        expect(dashboard.summary.activeProjectsPercentage).toBe(66.67);
        
        expect(dashboard.summary.projectsUp).toBe(1);
        expect(dashboard.summary.projectsUpPercentage).toBe(33.33);

        expect(dashboard.summary.projectsDown).toBe(1);
        expect(dashboard.summary.projectsDownPercentage).toBe(33.33);

        // upProject (100%) + downProject (0%) + inactiveProject (0%) = 100 / 3 = 33.33
        expect(dashboard.summary.overallUptimePercentage).toBe(33.33);

        // upProject average = 125. Others are 0. (125 / 1 valid project = 125)
        expect(dashboard.summary.averageResponseTime).toBe(125);
    });

    it("should map recent incidents correctly", async () => {
        const dashboard = await getUserDashboard({ userId: testUser.id });

        // There should be 2 incidents from the down project
        expect(dashboard.recentIncidents).toHaveLength(2);
        
        // Ensure they are ordered descending by default
        const newestIncident = dashboard.recentIncidents[0];
        const oldestIncident = dashboard.recentIncidents[1];
        
        expect(newestIncident.projectId).toBe(downProject.id);
        expect(newestIncident.projectName).toBe("Down Project");
        expect(newestIncident.statusCode).toBe(500);

        expect(newestIncident.createdAt.getTime()).toBeGreaterThan(oldestIncident.createdAt.getTime());
    });

    it("should map project overview correctly", async () => {
        const dashboard = await getUserDashboard({ userId: testUser.id });

        const upOverview = dashboard.projects.find(p => p.projectId === upProject.id);
        expect(upOverview).toBeDefined();
        expect(upOverview?.status).toBe('UP');
        expect(upOverview?.uptimePercentage).toBe(100);
        expect(upOverview?.averageResponseTime).toBe(125);
        expect(upOverview?.active).toBe(true);

        const downOverview = dashboard.projects.find(p => p.projectId === downProject.id);
        expect(downOverview).toBeDefined();
        expect(downOverview?.status).toBe('DOWN');
        expect(downOverview?.uptimePercentage).toBe(0);
        expect(downOverview?.averageResponseTime).toBe(0);
        expect(downOverview?.active).toBe(true);

        const inactiveOverview = dashboard.projects.find(p => p.projectId === inactiveProject.id);
        expect(inactiveOverview).toBeDefined();
        expect(inactiveOverview?.status).toBe('UNKNOWN');
        expect(inactiveOverview?.uptimePercentage).toBe(0);
        expect(inactiveOverview?.averageResponseTime).toBe(0);
        expect(inactiveOverview?.active).toBe(false);
    });
});
