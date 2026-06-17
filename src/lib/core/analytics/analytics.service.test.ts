import { Project, User } from "../../../generated/prisma/browser";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
vi.setConfig({ hookTimeout: 30000, testTimeout: 30000 });
import prisma from "../../prisma";

import { ProjectNotFoundError } from "../projects/helpers/project.errors";
import {
    calculateUptimePercentage,
    calculateAverageResponseTime,
    getRecentFailures,
    getPingHistory
} from "./analytics.service";

let testUser: User;
let testProject1: Project;
let testProject2: Project;

describe("Analytics service tests", () => {

    beforeAll(async () => {
        testUser = await prisma.user.create({
            data: {
                username: "Analytics Test User",
                email: `analytics-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: new Date()
            }
        });

        testProject1 = await prisma.project.create({
            data: {
                userId: testUser.id,
                name: "Analytics Project 1",
                url: "https://project1.com",
                interval: 5,
                active: true
            }
        });

        testProject2 = await prisma.project.create({
            data: {
                userId: testUser.id,
                name: "Analytics Project 2",
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
        // This removes the N sequential queries bottleneck and runs instantly
        await prisma.pingLog.deleteMany({
            where: {
                projectId: { in: [testProject1.id, testProject2.id] }
            }
        });
    });

    describe("calculateUptimePercentage()", () => {
        it("should throw ProjectNotFoundError when project does not exist", async () => {
            await expect(
                calculateUptimePercentage({ projectId: "non-existent-project-id" })
            ).rejects.toThrow(ProjectNotFoundError);
        });

        it("should return 0 when there are no ping logs", async () => {
            const result = await calculateUptimePercentage({ projectId: testProject1.id });
            expect(result).toBe(0);
        });

        it("should calculate 100% uptime when all logs are successful", async () => {
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: true, responseTime: 100 },
                    { projectId: testProject1.id, success: true, responseTime: 150 }
                ]
            });

            const result = await calculateUptimePercentage({ projectId: testProject1.id });
            expect(result).toBe(100);
        });

        it("should calculate correctly with a mix of successful and failed logs and round to 2 decimal places", async () => {
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: true, responseTime: 100 },
                    { projectId: testProject1.id, success: false, responseTime: 5000 },
                    { projectId: testProject1.id, success: false, responseTime: 5000 }
                ]
            });

            const result = await calculateUptimePercentage({ projectId: testProject1.id });
            expect(result).toBe(33.33);
        });

        it("should isolate projects when calculating uptime", async () => {
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: true, responseTime: 100 },
                    { projectId: testProject2.id, success: false, responseTime: 5000 }
                ]
            });

            const result = await calculateUptimePercentage({ projectId: testProject1.id });
            expect(result).toBe(100);
        });
    });

    describe("calculateAverageResponseTime()", () => {
        it("should throw ProjectNotFoundError when project does not exist", async () => {
            await expect(
                calculateAverageResponseTime({ projectId: "non-existent-project-id" })
            ).rejects.toThrow(ProjectNotFoundError);
        });

        it("should return 0 when there are no logs", async () => {
            const result = await calculateAverageResponseTime({ projectId: testProject1.id });
            expect(result).toBe(0);
        });

        it("should return 0 when there are only failed logs", async () => {
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: false, responseTime: 5000 }
                ]
            });

            const result = await calculateAverageResponseTime({ projectId: testProject1.id });
            expect(result).toBe(0);
        });

        it("should calculate average response time of only successful logs", async () => {
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: true, responseTime: 100 },
                    { projectId: testProject1.id, success: true, responseTime: 200 },
                    { projectId: testProject1.id, success: false, responseTime: 5000 }
                ]
            });

            const result = await calculateAverageResponseTime({ projectId: testProject1.id });
            expect(result).toBe(150);
        });

        it("should calculate average independently of other projects", async () => {
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: true, responseTime: 100 },
                    { projectId: testProject2.id, success: true, responseTime: 500 }
                ]
            });

            const result = await calculateAverageResponseTime({ projectId: testProject1.id });
            expect(result).toBe(100);
        });
    });

    describe("getRecentFailures()", () => {
        it("should throw ProjectNotFoundError when project does not exist", async () => {
            await expect(
                getRecentFailures({ projectId: "non-existent-project-id" })
            ).rejects.toThrow(ProjectNotFoundError);
        });

        it("should return an empty array if there are no failures", async () => {
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: true, responseTime: 100 }
                ]
            });

            const result = await getRecentFailures({ projectId: testProject1.id });
            expect(result).toHaveLength(0);
        });

        it("should return only failed logs ordered by descending createdAt", async () => {
            const now = Date.now();
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: false, responseTime: 5000, createdAt: new Date(now - 3000) },
                    { projectId: testProject1.id, success: true, responseTime: 100, createdAt: new Date(now - 2000) },
                    { projectId: testProject1.id, success: false, responseTime: 5000, createdAt: new Date(now - 1000) }
                ]
            });

            const result = await getRecentFailures({ projectId: testProject1.id });
            
            expect(result).toHaveLength(2);
            expect(result[0]?.success).toBe(false);
            expect(result[1]?.success).toBe(false);
            expect(result[0]?.createdAt.getTime()).toBeGreaterThan(result[1]?.createdAt.getTime());
        });

        it("should return a maximum of 10 records", async () => {
            const failures = Array.from({ length: 15 }).map((_, i) => ({
                projectId: testProject1.id,
                success: false,
                responseTime: 5000,
                createdAt: new Date(Date.now() - i * 1000)
            }));

            await prisma.pingLog.createMany({ data: failures });

            const result = await getRecentFailures({ projectId: testProject1.id });
            expect(result).toHaveLength(10);
        });
        
        it("should isolate failed logs by project", async () => {
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: false, responseTime: 5000 },
                    { projectId: testProject2.id, success: false, responseTime: 5000 }
                ]
            });

            const result = await getRecentFailures({ projectId: testProject1.id });
            expect(result).toHaveLength(1);
            expect(result[0]?.projectId).toBe(testProject1.id);
        });
    });

    describe("getPingHistory()", () => {
        it("should throw ProjectNotFoundError when project does not exist", async () => {
            await expect(
                getPingHistory({ projectId: "non-existent-project-id" })
            ).rejects.toThrow(ProjectNotFoundError);
        });

        it("should return empty array when no logs exist", async () => {
            const result = await getPingHistory({ projectId: testProject1.id });
            expect(result).toHaveLength(0);
        });

        it("should return all logs for the project ordered by ascending createdAt", async () => {
            const now = Date.now();
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: true, responseTime: 120, createdAt: new Date(now - 1000) },
                    { projectId: testProject1.id, success: false, responseTime: 5000, createdAt: new Date(now - 3000) }
                ]
            });

            const result = await getPingHistory({ projectId: testProject1.id });
            
            expect(result).toHaveLength(2);
            expect(result[0]?.createdAt.getTime()).toBeLessThan(result[1]?.createdAt.getTime());
        });

        it("should retrieve logs isolated to the specified project", async () => {
            await prisma.pingLog.createMany({
                data: [
                    { projectId: testProject1.id, success: true, responseTime: 100 },
                    { projectId: testProject2.id, success: true, responseTime: 200 }
                ]
            });

            const result = await getPingHistory({ projectId: testProject1.id });
            expect(result).toHaveLength(1);
            expect(result[0]?.projectId).toBe(testProject1.id);
        });
    });
});