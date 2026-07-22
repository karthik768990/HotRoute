import { describe, it, vi, beforeEach, expect } from "vitest";
import { Project } from "../../../generated/prisma/browser";
import { InMemoryQueue } from "../queue/queue.memory";
import * as SchedulerService from './scheduler.service';
import prisma from "../../prisma";

vi.mock("../../prisma", () => ({
    default: {
        $queryRaw: vi.fn()
    }
}));

describe('scheduler service module ', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('findProjectsDueForPing()', () => {
        it('should return empty array when no active projects exist or are due', async () => {
            vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

            const result = await SchedulerService.findProjectsDueForPing();

            expect(result).toEqual([]);
        })

        it('should return only due projects returned by queryRaw', async () => {
            const now = new Date();
            const dueProject = {
                id: "project-1",
                interval: 5,
                lastPingAt: new Date(now.getTime() - 10 * 60 * 1000),
            } as Project;

            vi.mocked(prisma.$queryRaw).mockResolvedValue([dueProject]);

            const result = await SchedulerService.findProjectsDueForPing();

            expect(result).toEqual([dueProject]);
        })
    })

    describe('enqueueDueProjects()', () => {
        it('should not enqueue anything when no projects are due', async () => {
            const queue = {
                enqueue: vi.fn(),
            } as unknown as InMemoryQueue;

            vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

            await SchedulerService.enqueueDueProjects(queue);

            expect(queue.enqueue).not.toHaveBeenCalled();
        })

        it('should enqueue one due project', async () => {
            const queue = {
                enqueue: vi.fn(),
            } as unknown as InMemoryQueue;

            const project = {
                id: "project-1",
                interval: 5,
                lastPingAt: null,
            } as Project;

            vi.mocked(prisma.$queryRaw).mockResolvedValue([project]);

            await SchedulerService.enqueueDueProjects(queue);

            expect(queue.enqueue).toHaveBeenCalledTimes(1);
            expect(queue.enqueue).toHaveBeenCalledWith({ projectId: "project-1" });
        })

        it('should enqueue multiple due projects ', async () => {
            const queue = {
                enqueue: vi.fn(),
            } as unknown as InMemoryQueue;

            const project1 = { id: "project-1", interval: 5, lastPingAt: null } as Project;
            const project2 = { id: "project-2", interval: 5, lastPingAt: null } as Project;
            const project3 = { id: "project-3", interval: 5, lastPingAt: null } as Project;

            vi.mocked(prisma.$queryRaw).mockResolvedValue([
                project1, project2, project3,
            ]);

            await SchedulerService.enqueueDueProjects(queue);

            expect(queue.enqueue).toHaveBeenCalledTimes(3);
            expect(queue.enqueue).toHaveBeenNthCalledWith(1, { projectId: "project-1" });
            expect(queue.enqueue).toHaveBeenNthCalledWith(2, { projectId: "project-2" });
            expect(queue.enqueue).toHaveBeenNthCalledWith(3, { projectId: "project-3" });
        })
    })
})
