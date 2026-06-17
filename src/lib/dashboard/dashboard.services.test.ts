import { Project, User } from "../../generated/prisma/browser";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
vi.setConfig({ hookTimeout: 30000, testTimeout: 30000 });
import prisma from "../prisma";

import { ProjectNotFoundError } from "../core/projects/helpers/project.errors";
import { getProjectDashboard } from "./dashboard.services";

let testUser: User;
let testProject1: Project;
let testProject2: Project;

describe("Dashboard service tests", () => {

    beforeAll(async () => {
        testUser = await prisma.user.create({
            data: {
                username: "Dashboard Test User",
                email: `dashboard-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: new Date()
            }
        });

        testProject1 = await prisma.project.create({
            data: {
                userId: testUser.id,
                name: "Dashboard Project 1",
                url: "https://project1.com",
                interval: 5,
                active: true
            }
        });

        testProject2 = await prisma.project.create({
            data: {
                userId: testUser.id,
                name: "Dashboard Project 2",
                url: "https://project2.com",
                interval: 5,
                active: true
            }
        });
    });

    afterAll(async () => {
        // OPTIMIZED: Bulk delete all logs for both projects in a single query
        await prisma.pingLog.deleteMany({
            where: {
                projectId: { in: [testProject1.id, testProject2.id] }
            }
        });

        await prisma.project.delete({ where: { id: testProject1.id } });
        await prisma.project.delete({ where: { id: testProject2.id } });

        await prisma.user.delete({ where: { id: testUser.id } });
    });

    afterEach(async () => {
        vi.clearAllMocks();

        // OPTIMIZED: Bulk delete all logs for both projects in a single query
        await prisma.pingLog.deleteMany({
            where: {
                projectId: { in: [testProject1.id, testProject2.id] }
            }
        });
    });

    describe("getProjectDashboard()", () => {
        
        it("should throw ProjectNotFoundError when project does not exist", async () => {
            await expect(
                getProjectDashboard({ projectId: "non-existent-project-id" })
            ).rejects.toThrow(ProjectNotFoundError);
        });

        describe("Status Boundaries", () => {
            it("should return UNKNOWN when no ping logs exist", async () => {
                const result = await getProjectDashboard({ projectId: testProject1.id });
                
                expect(result.summary.currentStatus).toBe("UNKNOWN");
                expect(result.summary.uptimePercentage).toBe(0);
                expect(result.summary.averageResponseTime).toBe(0);
                expect(result.recentFailures).toHaveLength(0);
                expect(result.recentHistory).toHaveLength(0);
            });

            it("should return UP when exactly one successful log exists", async () => {
                await prisma.pingLog.create({
                    data: { projectId: testProject1.id, success: true, responseTime: 100 }
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.currentStatus).toBe("UP");
            });

            it("should return DOWN when exactly one failed log exists", async () => {
                await prisma.pingLog.create({
                    data: { projectId: testProject1.id, success: false, responseTime: 5000 }
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.currentStatus).toBe("DOWN");
            });

            it("should use latest ping log when determining status (success -> success -> failure)", async () => {
                const now = Date.now();
                await prisma.pingLog.createMany({
                    data: [
                        { projectId: testProject1.id, success: true, responseTime: 100, createdAt: new Date(now - 3000) }, // Oldest
                        { projectId: testProject1.id, success: true, responseTime: 100, createdAt: new Date(now - 2000) },
                        { projectId: testProject1.id, success: false, responseTime: 5000, createdAt: new Date(now - 1000) } // Newest
                    ]
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.currentStatus).toBe("DOWN");
            });

            it("should ignore earlier failures when latest ping succeeded (failure -> failure -> success)", async () => {
                const now = Date.now();
                await prisma.pingLog.createMany({
                    data: [
                        { projectId: testProject1.id, success: false, responseTime: 5000, createdAt: new Date(now - 3000) }, // Oldest
                        { projectId: testProject1.id, success: false, responseTime: 5000, createdAt: new Date(now - 2000) },
                        { projectId: testProject1.id, success: true, responseTime: 100, createdAt: new Date(now - 1000) }  // Newest
                    ]
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.currentStatus).toBe("UP");
            });
        });

        describe("Recent History Boundaries", () => {
            it("should return empty recentHistory when no logs exist", async () => {
                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.recentHistory).toHaveLength(0);
            });

            it("should return single history record", async () => {
                await prisma.pingLog.create({
                    data: { projectId: testProject1.id, success: true, responseTime: 100 }
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.recentHistory).toHaveLength(1);
            });

            it("should return all history when history count is less than 50 (Boundary: 49)", async () => {
                const now = Date.now();
                const logs = Array.from({ length: 49 }).map((_, i) => ({
                    projectId: testProject1.id,
                    success: true,
                    responseTime: 100,
                    createdAt: new Date(now + i * 1000)
                }));
                await prisma.pingLog.createMany({ data: logs });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.recentHistory).toHaveLength(49);
            });

            it("should return exactly 50 history records when history count equals 50 (Boundary: 50)", async () => {
                const now = Date.now();
                const logs = Array.from({ length: 50 }).map((_, i) => ({
                    projectId: testProject1.id,
                    success: true,
                    responseTime: 100,
                    createdAt: new Date(now + i * 1000)
                }));
                await prisma.pingLog.createMany({ data: logs });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.recentHistory).toHaveLength(50);
            });

            it("should return latest 50 history records when history count exceeds limit (Boundary: 51)", async () => {
                const now = Date.now();
                const logs = Array.from({ length: 51 }).map((_, i) => ({
                    projectId: testProject1.id,
                    success: true,
                    responseTime: 100,
                    createdAt: new Date(now + i * 1000)
                }));
                await prisma.pingLog.createMany({ data: logs });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.recentHistory).toHaveLength(50);
                
                // Verify it kept the newest ones (index 1 to 50, since index 0 is oldest)
                const oldestReturned = result.recentHistory[0];
                expect(oldestReturned?.createdAt.getTime()).toBe(now + 1000); 
            });

            it("should return latest 50 records when history count is much larger (Stress: 100 logs)", async () => {
                const now = Date.now();
                const logs = Array.from({ length: 100 }).map((_, i) => ({
                    projectId: testProject1.id,
                    success: true,
                    responseTime: 100,
                    createdAt: new Date(now + i * 1000)
                }));
                await prisma.pingLog.createMany({ data: logs });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.recentHistory).toHaveLength(50);
            });
        });

        describe("Summary Calculation Boundaries", () => {
            it("should return uptime 0 for empty project", async () => {
                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.uptimePercentage).toBe(0);
            });

            it("should return uptime 100 for single successful ping", async () => {
                await prisma.pingLog.create({
                    data: { projectId: testProject1.id, success: true, responseTime: 100 }
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.uptimePercentage).toBe(100);
            });

            it("should return uptime 0 for single failed ping", async () => {
                await prisma.pingLog.create({
                    data: { projectId: testProject1.id, success: false, responseTime: 5000 }
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.uptimePercentage).toBe(0);
            });

            it("should return 50 uptime for one success and one failure", async () => {
                await prisma.pingLog.createMany({
                    data: [
                        { projectId: testProject1.id, success: true, responseTime: 100 },
                        { projectId: testProject1.id, success: false, responseTime: 5000 }
                    ]
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.uptimePercentage).toBe(50);
            });

            it("should return 66.67 uptime for two successes and one failure", async () => {
                await prisma.pingLog.createMany({
                    data: [
                        { projectId: testProject1.id, success: true, responseTime: 100 },
                        { projectId: testProject1.id, success: true, responseTime: 200 },
                        { projectId: testProject1.id, success: false, responseTime: 5000 }
                    ]
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.uptimePercentage).toBe(66.67);
            });
        });

        describe("Average Response Time Boundaries", () => {
            it("should return averageResponseTime 0 when no successful pings exist", async () => {
                await prisma.pingLog.createMany({
                    data: [
                        { projectId: testProject1.id, success: false, responseTime: 5000 },
                        { projectId: testProject1.id, success: false, responseTime: 5000 }
                    ]
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.averageResponseTime).toBe(0);
            });

            it("should return response time for single successful ping", async () => {
                await prisma.pingLog.create({
                    data: { projectId: testProject1.id, success: true, responseTime: 123 }
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.averageResponseTime).toBe(123);
            });

            it("should ignore failed logs when calculating average", async () => {
                await prisma.pingLog.createMany({
                    data: [
                        { projectId: testProject1.id, success: true, responseTime: 100 },
                        { projectId: testProject1.id, success: true, responseTime: 300 },
                        { projectId: testProject1.id, success: false, responseTime: 9999 } // Failed log
                    ]
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                expect(result.summary.averageResponseTime).toBe(200); // (100 + 300) / 2
            });
        });

        describe("Project Isolation Boundaries", () => {
            it("should isolate project data and not include history or failures from another project", async () => {
                const now = Date.now();
                
                // Project A Data
                await prisma.pingLog.createMany({
                    data: [
                        { projectId: testProject1.id, success: true, responseTime: 100, createdAt: new Date(now - 2000) },
                        { projectId: testProject1.id, success: false, responseTime: 5000, createdAt: new Date(now - 1000) }
                    ]
                });

                // Project B Data (Noise)
                const projectBLogs = Array.from({ length: 30 }).map((_, i) => ({
                    projectId: testProject2.id,
                    success: true,
                    responseTime: 100,
                    createdAt: new Date(now - 5000 + i)
                }));
                await prisma.pingLog.createMany({ data: projectBLogs });
                await prisma.pingLog.createMany({
                    data: [
                        { projectId: testProject2.id, success: false, responseTime: 5000 },
                        { projectId: testProject2.id, success: false, responseTime: 5000 }
                    ]
                });

                const result = await getProjectDashboard({ projectId: testProject1.id });
                
                // Assertions for Dashboard A
                expect(result.recentHistory).toHaveLength(2);
                expect(result.recentFailures).toHaveLength(1);
                expect(result.summary.uptimePercentage).toBe(50);
                expect(result.summary.averageResponseTime).toBe(100);
                expect(result.summary.currentStatus).toBe("DOWN"); // Latest was a failure
                
                // Ensure none of Project B's 30 history or 2 failures leaked
                const allHistoryBelongToProjectA = result.recentHistory.every(log => log.projectId === testProject1.id);
                expect(allHistoryBelongToProjectA).toBe(true);

                const allFailuresBelongToProjectA = result.recentFailures.every(log => log.projectId === testProject1.id);
                expect(allFailuresBelongToProjectA).toBe(true);
            });
        });
    });
});