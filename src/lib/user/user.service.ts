import prisma from "../prisma";
import { hashPassword, verifyPassword } from "../auth/password";
import { OAuthAccountRequiredError } from "../auth/google/helpers/google.errors";

interface UpdateUserProfileInput {
    userId: string;
    username?: string;
    email?: string;
}

export async function updateUserProfile({ userId, username, email }: UpdateUserProfileInput) {
    const data: any = {};
    if (username) data.username = username.trim();
    if (email) {
        data.email = email.trim().toLowerCase();
        // check if email is taken
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing && existing.id !== userId) {
            throw new Error("Email already registered");
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data
    });

    return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
    };
}

interface UpdateUserPasswordInput {
    userId: string;
    currentPassword: string;
    newPassword: string;
}

export async function updateUserPassword({ userId, currentPassword, newPassword }: UpdateUserPasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    if (!user.password) {
        if (user.googleId) {
             throw new OAuthAccountRequiredError("This account uses Google Sign-In and does not have a password to update.");
        }
        // Fallback just in case they have no password and no Google ID (shouldn't happen, but safe)
        throw new Error("No password is set for this account.");
    }
    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) throw new Error("Incorrect current password");

    const newHashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
        where: { id: userId },
        data: { password: newHashedPassword }
    });

    return { success: true };
}
