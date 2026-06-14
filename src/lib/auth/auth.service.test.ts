import { beforeEach, describe, expect, it,afterEach } from "vitest";
import prisma from "../prisma";
import "dotenv/config"


function getTestEmail() {
    return `test-${crypto.randomUUID()}@test.com`;
}

let createdUserIds: string[] = [];
import {
    registerUser,
    loginUser,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword
} from "./auth.service";

import { hashPassword } from "./password";
beforeEach(async () => {
    createdUserIds = [];
});


afterEach(async () => {
    await prisma.project.deleteMany({
        where: {
            userId: {
                in: createdUserIds
            }
        }
    });

    await prisma.passwordResetToken.deleteMany({
        where: {
            userId: {
                in: createdUserIds
            }
        }
    });

    await prisma.verificationToken.deleteMany({
        where: {
            userId: {
                in: createdUserIds
            }
        }
    });

    await prisma.user.deleteMany({
        where: {
            id: {
                in: createdUserIds
            }
        }
    });
});

describe("registerUser", () => {
    it("should create a new user", async () => {
        const email  = getTestEmail()
        const user = await registerUser({
            name: "Karthik",
            email,
            password: "password123"
        });

        createdUserIds.push(user.id);

        expect(user.email).toBe(email);
        expect(user.username).toBe("Karthik");
    });

    it("should hash the password", async () => {
        const email  = getTestEmail()

        const registeredUser = await registerUser({
            name: "Karthik",
            email,
            password: "password123"
        });

        createdUserIds.push(registeredUser.id);

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        expect(user?.password).not.toBe("password123");
    });

    it("should reject duplicate email", async () => {
        const email  = getTestEmail()

        const user = await registerUser({
            name: "Karthik",
            email,
            password: "password123"
        });

        createdUserIds.push(user.id);

        await expect(
            registerUser({
                name: "Another",
                email,
                password: "password123"
            })
        ).rejects.toThrow();
    });
});

describe("loginUser", () => {
    it("should login verified user", async () => {
        const password = await hashPassword("password123");
        const email  = getTestEmail()

        const user = await prisma.user.create({
            data: {
                username: "Karthik",
                email: email,
                password,
                verifiedAt: new Date()
            }
        });
        createdUserIds.push(user.id);

        const result = await loginUser({
            email: user.email,
            password: "password123"
        });

        expect(result.accessToken).toBeDefined();
        expect(result.user.id).toBe(user.id);
    });

    it("should reject invalid password", async () => {
        const password = await hashPassword("password123");
        const email  = getTestEmail()

        const user = await prisma.user.create({
            data: {
                username: "Karthik",
                email: email,
                password,
                verifiedAt: new Date()
            }
        });
        createdUserIds.push(user.id);

        await expect(
            loginUser({
                email: email,
                password: "wrongPassword"
            })
        ).rejects.toThrow();
    });
});

describe("verifyEmail", () => {
    it("should verify user", async () => {
        const email  = getTestEmail()

        const user = await prisma.user.create({
            data: {
                username: "Karthik",
                email: email,
                password: "hashed"
            }
        });
        createdUserIds.push(user.id);

        const token = await prisma.verificationToken.create({
            data: {
                token: "verify-token",
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60)
            }
        });

        await verifyEmail({
            token: token.token
        });

        const updatedUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        });

        expect(updatedUser?.verifiedAt).not.toBeNull();
    });
});

describe("forgotPassword", () => {
    it("should create password reset token", async () => {
        const email  = getTestEmail()

        const user = await prisma.user.create({
            data: {
                username: "Karthik",
                email: email,
                password: "hashed"
            }
        });
        createdUserIds.push(user.id);

        await forgotPassword({
            email: user.email
        });

        const token = await prisma.passwordResetToken.findFirst({
            where: {
                userId: user.id
            }
        });

        expect(token).not.toBeNull();
    });
});

describe("resetPassword", () => {
    it("should update password", async () => {
        const oldPassword = await hashPassword("oldPassword");
        const email  = getTestEmail()

        const user = await prisma.user.create({
            data: {
                username: "Karthik",
                email: email,
                password: oldPassword
            }
        });
        createdUserIds.push(user.id);

        const token = await prisma.passwordResetToken.create({
            data: {
                token: "reset-token",
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60)
            }
        });

        await resetPassword({
            token: token.token,
            newPassword: "newPassword123"
        });

        const updatedUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        });

        expect(updatedUser?.password).not.toBe(oldPassword);
    });
});


