import { describe, it } from "vitest";
import prisma from "./prisma";

describe("debug", () => {
    it("can access password reset table", async () => {
        const count = await prisma.passwordResetToken.count();
        console.log("count =", count);
    });
});