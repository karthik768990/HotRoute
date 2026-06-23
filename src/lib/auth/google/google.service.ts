import prisma from "../../../lib/prisma";
import { User } from "@/generated/prisma/browser";
import { verifyGoogleCredential } from "./google.helper";
import { GoogleLoginInput } from "./google.types";

export async function loginWithGoogle({ credential }: GoogleLoginInput): Promise<User> {
    const payload = await verifyGoogleCredential(credential)

    let user = await prisma.user.findFirst({
        where: {
            OR: [
                { googleId: payload.googleId },
                { email: payload.email }
            ]
        }
    })

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: payload.email,
                username: payload.username,
                googleId: payload.googleId,
                verifiedAt: new Date()
            }
        })
        return user;
    }
    const updates: Partial<User> = {};
    let needsUpdate = false
    if (!user.googleId) {
        updates.googleId = payload.googleId
        needsUpdate = true
    }

    if (!user.verifiedAt) {
        updates.verifiedAt = new Date()
        needsUpdate = true
    }

    if (needsUpdate) {
        user = await prisma.user.update({
            where: { id: user.id },
            data: updates
        })
    }
    return user;
}
