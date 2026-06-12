import { beforeEach, describe, expect, it } from "vitest";
import prisma from "../prisma";

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
    await prisma.passwordResetToken.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();
});

describe("registerUser", () => {
    it("should create a new user", async () => {
        const user = await registerUser({
            name: "Karthik",
            email: "karthik@test.com",
            password: "password123"
        });

        expect(user.email).toBe("karthik@test.com");
        expect(user.username).toBe("Karthik");
    });

    it("should hash the password", async () => {
        await registerUser({
            name: "Karthik",
            email: "karthik@test.com",
            password: "password123"
        });

        const user = await prisma.user.findUnique({
            where: {
                email: "karthik@test.com"
            }
        });

        expect(user?.password).not.toBe("password123");
    });

    it("should reject duplicate email", async () => {
        await registerUser({
            name: "Karthik",
            email: "karthik@test.com",
            password: "password123"
        });

        await expect(
            registerUser({
                name: "Another",
                email: "karthik@test.com",
                password: "password123"
            })
        ).rejects.toThrow();
    });
});

describe("loginUser", () => {
    it("should login verified user", async () => {
        const password = await hashPassword("password123");

        const user = await prisma.user.create({
            data: {
                username: "Karthik",
                email: "karthik@test.com",
                password,
                verifiedAt: new Date()
            }
        });

        const result = await loginUser({
            email: user.email,
            password: "password123"
        });

        expect(result.accessToken).toBeDefined();
        expect(result.user.id).toBe(user.id);
    });

    it("should reject invalid password", async () => {
        const password = await hashPassword("password123");

        await prisma.user.create({
            data: {
                username: "Karthik",
                email: "karthik@test.com",
                password,
                verifiedAt: new Date()
            }
        });

        await expect(
            loginUser({
                email: "karthik@test.com",
                password: "wrongPassword"
            })
        ).rejects.toThrow();
    });
});

describe("verifyEmail", () => {
    it("should verify user", async () => {
        const user = await prisma.user.create({
            data: {
                username: "Karthik",
                email: "karthik@test.com",
                password: "hashed"
            }
        });

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
        const user = await prisma.user.create({
            data: {
                username: "Karthik",
                email: "karthik@test.com",
                password: "hashed"
            }
        });

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

        const user = await prisma.user.create({
            data: {
                username: "Karthik",
                email: "karthik@test.com",
                password: oldPassword
            }
        });

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