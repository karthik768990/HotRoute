import { Project, User } from "../../../generated/prisma/browser";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
vi.setConfig({ hookTimeout: 30000, testTimeout: 30000 });
import prisma from "../../prisma";

import { ProjectNotFoundError } from "../projects/helpers/project.errors";
import { performPing } from "./ping.service";
import * as pingHelper from "./helpers/ping.helper";

vi.mock("./helpers/ping.helper", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./helpers/ping.helper")>();
    return {
        ...actual,
        executePing: vi.fn()
    };
});

let testUser: User;
let activeProject: Project;
let inactiveProject: Project;

describe("Ping service tests", () => {
    describe("performPing()", () => {

        beforeAll(async () => {

            testUser = await prisma.user.create({
                data: {
                    username: "Ping Test User",
                    email: `ping-${Date.now()}@test.com`,
                    password: "hashed-password",
                    verifiedAt: new Date()
                }
            });

            activeProject = await prisma.project.create({
                data: {
                    userId: testUser.id,
                    name: "Active Project",
                    url: "https://google.com",
                    interval: 5,
                    active: true
                }
            });

            inactiveProject = await prisma.project.create({
                data: {
                    userId: testUser.id,
                    name: "Inactive Project",
                    url: "https://github.com",
                    interval: 5,
                    active: false
                }
            });

        });

        afterAll(async () => {
            const logs1 = await prisma.pingLog.findMany({ where: { projectId: activeProject.id } });
            for (const log of logs1) { await prisma.pingLog.delete({ where: { id: log.id } }); }
            const logs2 = await prisma.pingLog.findMany({ where: { projectId: inactiveProject.id } });
            for (const log of logs2) { await prisma.pingLog.delete({ where: { id: log.id } }); }

            await prisma.project.delete({ where: { id: activeProject.id } });
            await prisma.project.delete({ where: { id: inactiveProject.id } });

            await prisma.user.delete({
                where: { id: testUser.id }
            });
        });

        afterEach(async () => {
            vi.clearAllMocks();

            const logs1 = await prisma.pingLog.findMany({ where: { projectId: activeProject.id } });
            for (const log of logs1) { await prisma.pingLog.delete({ where: { id: log.id } }); }
            const logs2 = await prisma.pingLog.findMany({ where: { projectId: inactiveProject.id } });
            for (const log of logs2) { await prisma.pingLog.delete({ where: { id: log.id } }); }
        });

        it("should throw ProjectNotFoundError when project does not exist", async () => {

            await expect(
                performPing({
                    projectId: "non-existent-project-id"
                })
            ).rejects.toThrow(ProjectNotFoundError);

        });

        it("should return null value when project is inactive", async () => {

            const result = await performPing({
                projectId: inactiveProject.id
            });

            expect(result).toBeNull();

            const pingLogs = await prisma.pingLog.findMany({
                where: {
                    projectId: inactiveProject.id
                }
            });

            expect(pingLogs).toHaveLength(0);

        });

        // Next tests go here


        it("should create ping log for successful ping", async () => {

            vi.mocked(pingHelper.executePing)
                .mockResolvedValue({
                    statusCode: 200,
                    responseTime: 120,
                    success: true,
                    errorMessage: null
                });

            await performPing({
                projectId: activeProject.id
            });

            const pingLogs = await prisma.pingLog.findMany({
                where: {
                    projectId: activeProject.id
                }
            });

            expect(pingLogs).toHaveLength(1);

            expect(pingLogs[0]?.projectId)
                .toBe(activeProject.id);

            expect(pingLogs[0]?.statusCode)
                .toBe(200);

            expect(pingLogs[0]?.responseTime)
                .toBe(120);

            expect(pingLogs[0]?.success)
                .toBe(true);

        });

        it("should update lastPingAt after successful ping", async () => {

            vi.mocked(pingHelper.executePing)
                .mockResolvedValue({
                    statusCode: 200,
                    responseTime: 120,
                    success: true,
                    errorMessage: null
                });

            await performPing({
                projectId: activeProject.id
            });

            const updatedProject = await prisma.project.findUnique({
                where: {
                    id: activeProject.id
                }
            });

            expect(updatedProject).not.toBeNull();

            expect(updatedProject?.lastPingAt)
                .not.toBeNull();

        });



        it("should create failed ping log when ping fails", async () => {

            vi.mocked(pingHelper.executePing)
                .mockResolvedValue({
                    statusCode: null,
                    responseTime: 5000,
                    success: false,
                    errorMessage: "Request timeout"
                });

            await performPing({
                projectId: activeProject.id
            });

            const pingLogs = await prisma.pingLog.findMany({
                where: {
                    projectId: activeProject.id
                }
            });

            expect(pingLogs).toHaveLength(1);

            expect(pingLogs[0]?.success)
                .toBe(false);

            expect(pingLogs[0]?.statusCode)
                .toBeNull();

            expect(pingLogs[0]?.errorMessage)
                .toBe("Request timeout");

        });




        it("should return PerformPingOutput for successful ping", async () => {

            vi.mocked(pingHelper.executePing)
                .mockResolvedValue({
                    statusCode: 200,
                    responseTime: 120,
                    success: true,
                    errorMessage: null
                });

            const result = await performPing({
                projectId: activeProject.id
            });

            expect(result).not.toBeNull();

            expect(result?.projectId)
                .toBe(activeProject.id);

            expect(result?.statusCode)
                .toBe(200);

            expect(result?.responseTime)
                .toBe(120);

            expect(result?.success)
                .toBe(true);

            expect(result?.errorMessage)
                .toBeNull();

            expect(result?.createdAt)
                .toBeInstanceOf(Date);

        });


        it("should call executePing with project url", async () => {

            const executePingSpy = vi
                .mocked(pingHelper.executePing)
                .mockResolvedValue({
                    statusCode: 200,
                    responseTime: 120,
                    success: true,
                    errorMessage: null
                });

            await performPing({
                projectId: activeProject.id
            });

            expect(executePingSpy)
                .toHaveBeenCalledWith({
                    url: activeProject.url
                });

        });

    });
});

