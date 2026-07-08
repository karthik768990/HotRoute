import { describe, it, vi, beforeEach, expect } from "vitest";
import { Project } from "../../../generated/prisma/browser";
import { InMemoryQueue } from "../queue/queue.memory";
import * as SchedulerProjects from './helpers/scheduler.projects'
import * as SchedulerService from './scheduler.service'

describe('scheduler service module ', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });
    describe('isProjectDueForPing()', () => {

        it('should return true when the lastPingAt is null', async () => {
            const project = {
                lastPingAt: null,
                interval: 5,
            } as Project;

            expect(
                SchedulerService.isProjectDueForPing(project, new Date())
            ).toBe(true);


        })
        it('should return true when the interval has elapsed', async () => {
            const now = new Date();

            const project = {
                lastPingAt: new Date(
                    now.getTime() - 10 * 60 * 1000
                ),
                interval: 5,
            } as Project;

            expect(
                SchedulerService.isProjectDueForPing(project, now)
            ).toBe(true);
        })

        it('should return false when interval has not  elapsed', async () => {
            const now = new Date();

            const project = {
                lastPingAt: new Date(
                    now.getTime() - 2 * 60 * 1000
                ),
                interval: 5,
            } as Project;

            expect(
                SchedulerService.isProjectDueForPing(project, now)
            ).toBe(false);

        })
        it('should return true when current time equals next ping time ', async () => {
            const now = new Date();

            const project = {
                lastPingAt: new Date(
                    now.getTime() - 5 * 60 * 1000
                ),
                interval: 5,
            } as Project;

            expect(
                SchedulerService.isProjectDueForPing(project, now)
            ).toBe(true);
        })



        it('should return true when lastPingAt is null', async () => {

            const project = {
                lastPingAt: null,
                interval: 5,
            } as Project;

            expect(
                SchedulerService.isProjectDueForPing(project, new Date())
            ).toBe(true);

        })

        it('should return true when interval has elapsed', async () => {
            const now = new Date();

            const project = {
                lastPingAt: new Date(
                    now.getTime() - 10 * 60 * 1000
                ),
                interval: 5,
            } as Project;

            expect(
                SchedulerService.isProjectDueForPing(project, now)
            ).toBe(true);
        })


        it('should return false when interval has not elapsed', async () => {
            const now = new Date();

            const project = {
                lastPingAt: new Date(
                    now.getTime() - 2 * 60 * 1000
                ),
                interval: 5,
            } as Project;

            expect(
                SchedulerService.isProjectDueForPing(project, now)
            ).toBe(false);

        })

        it('should return true when current time equals next ping time', async () => {
            const now = new Date();

            const project = {
                lastPingAt: new Date(
                    now.getTime() - 5 * 60 * 1000
                ),
                interval: 5,
            } as Project;

            expect(
                SchedulerService.isProjectDueForPing(project, now)
            ).toBe(true);
        })

    })
    describe('findProjectsDueForPing()', () => {
        it('should return empty array when no active project is exist', async () => {
            vi.spyOn(SchedulerProjects,
                "getAllActiveProjects"
            ).mockResolvedValue([]);

            const result =
                await SchedulerService.findProjectsDueForPing();

            expect(result).toEqual([]);
        })


        it('should return empty array when no active projects exist', async () => {
            vi.spyOn(
                SchedulerProjects,
                "getAllActiveProjects"
            ).mockResolvedValue([]);

            const result =
                await SchedulerService.findProjectsDueForPing();

            expect(result).toEqual([]);


        })

        it('should return only due projects ', async () => {

            const now = new Date();

            const dueProject = {
                id: "project-1",
                interval: 5,
                lastPingAt: new Date(
                    now.getTime() - 10 * 60 * 1000
                ),
            } as Project;

            const notDueProject = {
                id: "project-2",
                interval: 5,
                lastPingAt: new Date(
                    now.getTime() - 2 * 60 * 1000
                ),
            } as Project;

            vi.spyOn(
                SchedulerProjects,
                "getAllActiveProjects"
            ).mockResolvedValue([
                dueProject,
                notDueProject,
            ]);

            const result =
                await SchedulerService.findProjectsDueForPing();

            expect(result).toEqual([
                dueProject,
            ]);

        })


        it('should return all projects that have never been pinged ', async () => {


            const project1 = {
                id: "project-1",
                interval: 5,
                lastPingAt: null,
            } as Project;

            const project2 = {
                id: "project-2",
                interval: 10,
                lastPingAt: null,
            } as Project;

            vi.spyOn(
                SchedulerProjects,
                "getAllActiveProjects"
            ).mockResolvedValue([
                project1,
                project2,
            ]);

            const result =
                await SchedulerService.findProjectsDueForPing();

            expect(result).toEqual([
                project1,
                project2,
            ]);

        })
    })

    // the enqueue tests start here 
    describe('enqueueDueProjects()', () => {
        it('should not enqueue anything when no projects are due', async () => {
            const queue = {
                enqueue: vi.fn(),
            } as unknown as InMemoryQueue;

            vi.spyOn(
                SchedulerProjects,
                "getAllActiveProjects"
            ).mockResolvedValue([]);

            await SchedulerService.enqueueDueProjects(
                queue
            );

            expect(
                queue.enqueue
            ).not.toHaveBeenCalled();

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

            vi.spyOn(
                SchedulerProjects,
                "getAllActiveProjects"
            ).mockResolvedValue([project]);

            await SchedulerService.enqueueDueProjects(queue);

            expect(
                queue.enqueue
            ).toHaveBeenCalledTimes(1);

            expect(
                queue.enqueue
            ).toHaveBeenCalledWith({
                projectId: "project-1",
            });
        })

        it('should enqueue multiple due projects ', async () => {
            const queue = {
                enqueue: vi.fn(),
            } as unknown as InMemoryQueue;

            const project1 = {
                id: "project-1",
                interval: 5,
                lastPingAt: null,
            } as Project;

            const project2 = {
                id: "project-2",
                interval: 5,
                lastPingAt: null,
            } as Project;

            const project3 = {
                id: "project-3",
                interval: 5,
                lastPingAt: null,
            } as Project;

            vi.spyOn(
                SchedulerProjects,
                "getAllActiveProjects"
            ).mockResolvedValue([
                project1,
                project2,
                project3,
            ]);

            await SchedulerService.enqueueDueProjects(queue);

            expect(
                queue.enqueue
            ).toHaveBeenCalledTimes(3);

            expect(
                queue.enqueue
            ).toHaveBeenNthCalledWith(
                1,
                { projectId: "project-1" }
            );

            expect(
                queue.enqueue
            ).toHaveBeenNthCalledWith(
                2,
                { projectId: "project-2" }
            );

            expect(
                queue.enqueue
            ).toHaveBeenNthCalledWith(
                3,
                { projectId: "project-3" }
            );
        })
    })



})