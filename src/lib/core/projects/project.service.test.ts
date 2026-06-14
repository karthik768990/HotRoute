import { afterAll,beforeEach ,afterEach, beforeAll, describe, expect, it } from "vitest";
import { CreateProjectInput } from "./project.types";
import { createProject, updateProject } from "./project.service";
import { InvalidProjectUrlError, UnauthorizedProjectAccessError, UnsafeMonitoringTargetError, UserNotFoundError, UserNotVerifiedError } from "./helpers/project.errors";
import "dotenv/config"
import { Project } from "../../../generated/prisma/browser"
import prisma from "../../prisma";

console.log("DATABASE url " + process.env.DATABASE_URL)

let userId: string
beforeAll(async () => {
    const user = await prisma.user.create({
        data: {
            username: "project-test-user",
            email: `project-test-${Date.now()}@gmail.com`,
            password: "hashed-password",
            verifiedAt: new Date()
        }
    });

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
                .toThrow();
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
                .toThrow();
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
                .toThrow();

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
                .toThrow();
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
    beforeEach(async()=>{
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
        ).rejects.toThrow();


    })


    it('should reject invalid name', async () => {
        await expect(
            updateProject({
                projectId: project.id,
                userId,
                name: ""
            })
        ).rejects.toThrow();
    })


    it('should reject invalid url', async () => {
        await expect(
            updateProject({
                projectId: project.id,
                userId,
                url: "ftp://google.com"
            })
        ).rejects.toThrow();
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

    it('should throw when project does not exist ',async()=>{
        await expect(
            updateProject({
                projectId: "fake-project-id",
                userId,
                name: "Updated"
            })
        ).rejects.toThrow();
    })
    afterEach(async()=>{
        await prisma.project.delete({
        where:{
            id:project.id
        }
    })
})
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