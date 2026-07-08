import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "../../../lib/prisma"; // Adjust path to your Prisma client
import { loginWithGoogle } from "./google.service";
import * as googleHelper from "./google.helper";

// Only mock the external Google call, keep database operations real
vi.mock("./google.helper", () => ({
    verifyGoogleCredential: vi.fn()
}));

let createdUserIds: string[] = [];

describe("Google Service Tests", () => {
    
    beforeEach(() => {
        createdUserIds = [];
        vi.clearAllMocks();
    });

    afterEach(async () => {
        // Clean up any users created during the tests
        if (createdUserIds.length > 0) {
            await prisma.user.deleteMany({
                where: { id: { in: createdUserIds } }
            });
        }
    });

    afterAll(async () => {
        // Final fallback cleanup just in case
        await prisma.user.deleteMany({
            where: { email: { contains: "google-test" } }
        });
    });

    describe("loginWithGoogle()", () => {

        it("Test 1: New Google User - should create a new user and auto-verify them", async () => {
            const mockPayload = {
                googleId: `google-123-${Date.now()}`,
                email: "new-google-test@test.com",
                username: "NewGoogleUser",
                emailVerified: true
            };

            vi.mocked(googleHelper.verifyGoogleCredential).mockResolvedValue(mockPayload);

            // Execute service
            const user = await loginWithGoogle({ credential: "mock-jwt" });
            createdUserIds.push(user.id);

            // Assert returned object
            expect(user.email).toBe(mockPayload.email);
            expect(user.googleId).toBe(mockPayload.googleId);
            expect(user.verifiedAt).not.toBeNull(); // Trust Google's verification

            // Assert Database State
            const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
            expect(dbUser).not.toBeNull();
            expect(dbUser?.googleId).toBe(mockPayload.googleId);
            expect(dbUser?.password).toBeNull(); // No password for OAuth users
        });

        it("Test 2: Existing Local User - should link googleId to existing email/password account", async () => {
            // 1. Setup: User manually registered previously
            const testEmail = `existing-local-test-${Date.now()}@test.com`;
            const existingUser = await prisma.user.create({
                data: {
                    email: testEmail,
                    username: "LocalUser",
                    password: "hashed-password",
                    verifiedAt: null // Assume they never verified their email
                }
            });
            createdUserIds.push(existingUser.id);

            // 2. Setup: Google login payload matching that email
            const mockPayload = {
                googleId: `google-456-${Date.now()}`,
                email: testEmail,
                username: "LocalUserFromGoogle",
                emailVerified: true
            };

            vi.mocked(googleHelper.verifyGoogleCredential).mockResolvedValue(mockPayload);

            // 3. Execute
            const linkedUser = await loginWithGoogle({ credential: "mock-jwt" });

            // 4. Assertions
            expect(linkedUser.id).toBe(existingUser.id); // Should be the exact same user
            expect(linkedUser.googleId).toBe(mockPayload.googleId); // Google ID should now be linked
            expect(linkedUser.verifiedAt).not.toBeNull(); // Should auto-verify based on Google payload

            // Verify no duplicate users were created
            const totalUsers = await prisma.user.count({
                where: { email: testEmail }
            });
            expect(totalUsers).toBe(1);
        });

        it("Test 3: Existing Google User - should return the same user without duplicating", async () => {
            const mockPayload = {
                googleId: `google-789-${Date.now()}`,
                email: `returning-google-test-${Date.now()}@test.com`,
                username: "ReturningUser",
                emailVerified: true
            };

            vi.mocked(googleHelper.verifyGoogleCredential).mockResolvedValue(mockPayload);

            // 1. First Login
            const firstLoginUser = await loginWithGoogle({ credential: "mock-jwt" });
            createdUserIds.push(firstLoginUser.id);

            // 2. Second Login (e.g., they logged out and logged back in)
            const secondLoginUser = await loginWithGoogle({ credential: "mock-jwt" });

            // Assertions
            expect(firstLoginUser.id).toBe(secondLoginUser.id); // Exact same user returned
            
            // Verify no duplicate rows
            const totalUsers = await prisma.user.count({
                where: { email: mockPayload.email }
            });
            expect(totalUsers).toBe(1);
        });

    });
});