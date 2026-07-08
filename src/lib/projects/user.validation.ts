import prisma from "../prisma";
import { UserNotFoundError, UserNotVerifiedError } from "./helpers/project.errors";

export async function validateUser(userId: string): Promise<void> {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!existingUser) {
        throw new UserNotFoundError("User does not exist");
    }

    if (existingUser.verifiedAt === null) {
        throw new UserNotVerifiedError("User has not verified yet");
    }
}