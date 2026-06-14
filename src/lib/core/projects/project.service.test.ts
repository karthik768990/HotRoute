import { afterAll, beforeEach, afterEach, beforeAll, describe, expect, it } from "vitest";
import { CreateProjectInput } from "./project.types";
import { createProject, deleteProject, getProjectById, listProjects, updateProject } from "./project.service";
import { InvalidIntervalError, InvalidProjectNameError, InvalidProjectUrlError, ProjectNotFoundError, UnauthorizedProjectAccessError, UnsafeMonitoringTargetError, UserNotFoundError, UserNotVerifiedError } from "./helpers/project.errors";
import "dotenv/config"
import { Project, User } from "../../../generated/prisma/browser"
import prisma from "../../prisma";

console.log("DATABASE url " + process.env.DATABASE_URL)

let userId: string
let verifiedUser: User;
beforeAll(async () => {
    const user = await prisma.user.create({
        data: {
            username: "project-test-user",
            email: `project-test-${Date.now()}@gmail.com`,
            password: "hashed-password",
            verifiedAt: new Date()
        }



    });
    const verifieduser = await prisma.user.create({
        data: {
            username: "Another User",
            email: `another-${Date.now()}@test.com`,
            password: "hashed-password",
            verifiedAt: new Date()
        }
    });
    verifiedUser = verifieduser

    userId = user.id;

    console.log("CREATED USER ID:", userId);

    const verify = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    console.log("CREATED USER RECORD:", verify);
});

describe('createProject()', () => {
    //url validation
    describe("URL Validation", () => {

        it("should throw InvalidProjectUrlError for empty url", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "      ",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(InvalidProjectUrlError);
        });

        it("should throw InvalidProjectUrlError for malformed url", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "google.com",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(InvalidProjectUrlError);
        });

        it("should throw InvalidProjectUrlError for ftp protocol", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "ftp://google.com",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(InvalidProjectUrlError);
        });

        it("should throw InvalidProjectUrlError for file protocol", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "file:///etc/passwd",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(InvalidProjectUrlError);
        });

        it("should throw UnsafeMonitoringTargetError for localhost", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "http://localhost:3000",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(UnsafeMonitoringTargetError);
        });

        it("should throw UnsafeMonitoringTargetError for 127.0.0.1", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "http://127.0.0.1",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(UnsafeMonitoringTargetError);
        });

        it("should throw UnsafeMonitoringTargetError for IPv6 loopback", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "http://[::1]",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(UnsafeMonitoringTargetError);
        });

        it("should throw UnsafeMonitoringTargetError for 10.x.x.x private network", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "http://10.0.0.5",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(UnsafeMonitoringTargetError);
        });

        it("should throw UnsafeMonitoringTargetError for 172.16.x.x private network", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "http://172.16.0.1",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(UnsafeMonitoringTargetError);
        });

        it("should throw UnsafeMonitoringTargetError for 192.168.x.x private network", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "http://192.168.1.1",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(UnsafeMonitoringTargetError);
        });

        it("should throw UnsafeMonitoringTargetError for cloud metadata endpoint", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "http://169.254.169.254",
                interval: 5,
            };

            await expect(createProject(input))
                .rejects
                .toThrow(UnsafeMonitoringTargetError);
        });

        it("should create project for valid https url", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid HTTPS Project",
                url: "https://google.com",
                interval: 5,
            };

            const result = await createProject(input);

            expect(result.userId).toBe(userId);
            expect(result.name).toBe("Valid HTTPS Project");
            expect(result.interval).toBe(5);
        });

        it("should create project for valid http url", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid HTTP Project",
                url: "http://example.com",
                interval: 5,
            };

            const result = await createProject(input);

            expect(result.userId).toBe(userId);
            expect(result.name).toBe("Valid HTTP Project");
            expect(result.interval).toBe(5);
        });

        it("should normalize url hostname casing", async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Normalization Test",
                url: "HTTPS://GOOGLE.COM/",
                interval: 5,
            };

            const result = await createProject(input);

            expect(result.url).toContain("google.com");
        });


    });
    describe('name validation', () => {
        it('should throw error for empty name', async () => {
            const input: CreateProjectInput = {
                userId,
                name: "",
                url: "https://google.com",
                interval: 5
            };

            await expect(createProject(input))
                .rejects
                .toThrow(InvalidProjectNameError);
        })
        it('should throw error for white space name', async () => {
            const input: CreateProjectInput = {
                userId,
                name: "      ",
                url: "https://google.com",
                interval: 5
            };

            await expect(createProject(input))
                .rejects
                .toThrow(InvalidProjectNameError);
        })

    })

    //interval validation
    describe("interval validation", () => {
        it('should throw error for zero interval', async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "https://google.com",
                interval: 0
            };

            await expect(createProject(input))
                .rejects
                .toThrow(InvalidIntervalError);

        })

        it('should throw error for negative interval', async () => {
            const input: CreateProjectInput = {
                userId,
                name: "Valid Project",
                url: "https://google.com",
                interval: -1
            };

            await expect(createProject(input))
                .rejects
                .toThrow(InvalidIntervalError);
        })
        //user validation

        it('should throw UserNotFoundError', async () => {
            const input: CreateProjectInput = {
                userId: "fake-user-id",
                name: "Valid Project",
                url: "https://google.com",
                interval: 5
            };

            await expect(createProject(input))
                .rejects
                .toThrow(UserNotFoundError);
        })
        it('should throw UserNotVerifiedError', async () => {
            const unverifiedUser = await prisma.user.create({
                data: {
                    username: "Unverified",
                    email: `unverified-${Date.now()}@test.com`,
                    password: "hashed-password",
                    verifiedAt: null
                }
            });

            const input: CreateProjectInput = {
                userId: unverifiedUser.id,
                name: "Valid Project",
                url: "https://google.com",
                interval: 5
            };

            await expect(createProject(input))
                .rejects
                .toThrow(UserNotVerifiedError);

            await prisma.user.delete({
                where: {
                    id: unverifiedUser.id
                }
            });
        })
    })

})


let project: Project;
describe('updateProject()', () => {
    beforeEach(async () => {
        project = await prisma.project.create({
            data: {
                userId,
                name: "Original Project",
                url: "https://google.com",
                interval: 5
            }
        });
    })

    it('should update project name', async () => {
        const result = await updateProject({
            projectId: project.id,
            userId,
            name: "Updated Name"
        });

        expect(result.name).toBe("Updated Name");

    })
    it('should update URL', async () => {
        const result = await updateProject({
            projectId: project.id,
            userId,
            url: "https://github.com"
        });

        expect(result.url).toBe("https://github.com");



    })
    it('should update project interval', async () => {

        const result = await updateProject({
            projectId: project.id,
            userId,
            interval: 15
        });

        expect(result.interval).toBe(15);

    })
    it("should update project active flag", async () => {
        const result = await updateProject({
            projectId: project.id,
            userId,
            active: false
        });

        expect(result.active).toBe(false);
    })

    it('should update multiple fields', async () => {

        const result = await updateProject({
            projectId: project.id,
            userId,
            name: "Updated",
            interval: 20,
            active: false
        });

        expect(result.name).toBe("Updated");
        expect(result.interval).toBe(20);
        expect(result.active).toBe(false);

    })


    it('should throw error when no fields provided', async () => {
        await expect(
            updateProject({
                projectId: project.id,
                userId
            })
        ).rejects.toThrow();
    })

    it('should reject invalid interval', async () => {
        await expect(
            updateProject({
                projectId: project.id,
                userId,
                interval: -5
            })
        ).rejects.toThrow(InvalidIntervalError);


    })


    it('should reject invalid name', async () => {
        await expect(
            updateProject({
                projectId: project.id,
                userId,
                name: ""
            })
        ).rejects.toThrow(InvalidProjectNameError);
    })


    it('should reject invalid url', async () => {
        await expect(
            updateProject({
                projectId: project.id,
                userId,
                url: "ftp://google.com"
            })
        ).rejects.toThrow(InvalidProjectUrlError);
    })

    it('should reject localhost url', async () => {
        await expect(
            updateProject({
                projectId: project.id,
                userId,
                url: "http://localhost:3000"
            })
        ).rejects.toThrow(UnsafeMonitoringTargetError);
    })

    it('should reject unauthorised user', async () => {

        const anotherUser = await prisma.user.create({
            data: {
                username: "Another User",
                email: `another-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: new Date()
            }
        });
        await expect(
            updateProject({
                projectId: project.id,
                userId: anotherUser.id,
                name: "Hack Attempt"
            })
        ).rejects.toThrow(UnauthorizedProjectAccessError);
        await prisma.user.delete({
            where: {
                id: anotherUser.id
            }
        });
    })

    it('should throw when project does not exist ', async () => {
        await expect(
            updateProject({
                projectId: "fake-project-id",
                userId,
                name: "Updated"
            })
        ).rejects.toThrow();
    })
    afterEach(async () => {
        await prisma.project.delete({
            where: {
                id: project.id
            }
        })
    })
})





describe("getProjectById()", () => {

    it("should return owned project", async () => {
        const project = await prisma.project.create({
            data: {
                userId,
                name: "Lookup Project",
                url: "https://google.com",
                interval: 5
            }
        });

        const result = await getProjectById({
            userId,
            projectId: project.id
        });

        expect(result.id).toBe(project.id);
        expect(result.userId).toBe(userId);

        await prisma.project.delete({
            where: {
                id: project.id
            }
        });


    })

    it("should throw ProjectNotFoundError", async () => {
        await expect(
            getProjectById({
                userId,
                projectId: crypto.randomUUID()
            })
        ).rejects.toThrow(ProjectNotFoundError);
    });

    it("should throw UnauthorizedProjectAccessError", async () => {
        const project = await prisma.project.create({
            data: {
                userId,
                name: "Private Project",
                url: "https://google.com",
                interval: 5
            }
        });

        const anotherUser = await prisma.user.create({
            data: {
                username: "Another User",
                email: `another-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: new Date()
            }
        });

        await expect(
            getProjectById({
                userId: anotherUser.id,
                projectId: project.id
            })
        ).rejects.toThrow(UnauthorizedProjectAccessError);

        await prisma.project.delete({
            where: {
                id: project.id
            }
        });

        await prisma.user.delete({
            where: {
                id: anotherUser.id
            }
        });
    });

    it("should throw UserNotFoundError", async () => {
        await expect(
            getProjectById({
                userId: crypto.randomUUID(),
                projectId: crypto.randomUUID()
            })
        ).rejects.toThrow(UserNotFoundError);
    });



    it("should throw UserNotVerifiedError", async () => {
        const unverifiedUser = await prisma.user.create({
            data: {
                username: "Unverified User",
                email: `unverified-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: null
            }
        });

        await expect(
            getProjectById({
                userId: unverifiedUser.id,
                projectId: crypto.randomUUID()
            })
        ).rejects.toThrow(UserNotVerifiedError);

        await prisma.user.delete({
            where: {
                id: unverifiedUser.id
            }
        });
    });
})


describe('listprojects()', () => {
    it("should return all user projects", async () => {
        const project1 = await prisma.project.create({
            data: {
                userId,
                name: "Project One",
                url: "https://one.com",
                interval: 5
            }
        });

        const project2 = await prisma.project.create({
            data: {
                userId,
                name: "Project Two",
                url: "https://two.com",
                interval: 5
            }
        });

        const projects = await listProjects({ userId });

        expect(projects.length).toBeGreaterThanOrEqual(2);

        await prisma.project.deleteMany({
            where: {
                id: {
                    in: [project1.id, project2.id]
                }
            }
        });
    });

    it("should return empty array when no projects exist", async () => {
        const emptyUser = await prisma.user.create({
            data: {
                username: "Empty User",
                email: `empty-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: new Date()
            }
        });

        const projects = await listProjects({
            userId: emptyUser.id
        });

        expect(projects).toEqual([]);

        await prisma.user.delete({
            where: {
                id: emptyUser.id
            }
        });
    });

    it("should return newest projects first", async () => {
        const olderProject = await prisma.project.create({
            data: {
                userId,
                name: "Older",
                url: "https://older.com",
                interval: 5
            }
        });

        await new Promise(resolve => setTimeout(resolve, 10));

        const newerProject = await prisma.project.create({
            data: {
                userId,
                name: "Newer",
                url: "https://newer.com",
                interval: 5
            }
        });

        const projects = await listProjects({ userId });

        expect(projects[0].id).toBe(newerProject.id);

        await prisma.project.deleteMany({
            where: {
                id: {
                    in: [olderProject.id, newerProject.id]
                }
            }
        });
    });


    it("should throw UserNotFoundError", async () => {
        await expect(
            listProjects({
                userId: crypto.randomUUID()
            })
        ).rejects.toThrow(UserNotFoundError);
    });


    it("should throw UserNotVerifiedError", async () => {
        const unverifiedUser = await prisma.user.create({
            data: {
                username: "Unverified",
                email: `unverified-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: null
            }
        });

        await expect(
            listProjects({
                userId: unverifiedUser.id
            })
        ).rejects.toThrow(UserNotVerifiedError);

        await prisma.user.delete({
            where: {
                id: unverifiedUser.id
            }
        });
    });




})





describe("deletedProject()", () => {
    it("should delete owned project", async () => {
        const project = await prisma.project.create({
            data: {
                userId,
                name: "Delete Me",
                url: "https://google.com",
                interval: 5
            }
        });

        await deleteProject({
            userId,
            projectId: project.id
        });

        const deletedProject = await prisma.project.findUnique({
            where: {
                id: project.id
            }
        });

        expect(deletedProject).toBeNull();
    });

    it("should throw ProjectNotFoundError", async () => {
        await expect(
            deleteProject({
                userId,
                projectId: crypto.randomUUID()
            })
        ).rejects.toThrow(ProjectNotFoundError);
    });

    it("should throw UnauthorizedProjectAccessError", async () => {
        const project = await prisma.project.create({
            data: {
                userId,
                name: "Protected Project",
                url: "https://google.com",
                interval: 5
            }
        });

        const anotherUser = await prisma.user.create({
            data: {
                username: "Another User",
                email: `another-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: new Date()
            }
        });

        await expect(
            deleteProject({
                userId: anotherUser.id,
                projectId: project.id
            })
        ).rejects.toThrow(UnauthorizedProjectAccessError);

        await prisma.project.delete({
            where: {
                id: project.id
            }
        });

        await prisma.user.delete({
            where: {
                id: anotherUser.id
            }
        });
    });


    it("should throw UserNotFoundError", async () => {
        await expect(
            deleteProject({
                userId: crypto.randomUUID(),
                projectId: crypto.randomUUID()
            })
        ).rejects.toThrow(UserNotFoundError);
    });


    it("should throw UserNotVerifiedError", async () => {
        const unverifiedUser = await prisma.user.create({
            data: {
                username: "Unverified",
                email: `unverified-${Date.now()}@test.com`,
                password: "hashed-password",
                verifiedAt: null
            }
        });

        await expect(
            deleteProject({
                userId: unverifiedUser.id,
                projectId: crypto.randomUUID()
            })
        ).rejects.toThrow(UserNotVerifiedError);

        await prisma.user.delete({
            where: {
                id: unverifiedUser.id
            }
        });
    });

})









afterAll(async () => {
    console.log("Deleting user:", userId);

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    console.log("User before cleanup:", user);

    await prisma.project.deleteMany({
        where: { userId }
    });

    await prisma.user.deleteMany({
        where: { id: userId }
    });
});