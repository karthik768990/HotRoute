import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { requireAuthenticatedUser } from "@/lib/auth/auth.helper";
import { updateUserProfile } from "@/lib/user/user.service";
import { updateProfileSchema } from "@/lib/api/api.validation";
import { ZodError } from "zod";

export async function PATCH(request: Request) {
    try {
        const user = await requireAuthenticatedUser(request);
        const body = await request.json().catch(() => ({}));
        const validated = updateProfileSchema.parse(body);
        
        const result = await updateUserProfile({
            userId: user.id,
            username: validated.username,
            email: validated.email
        });
        
        return successResponse(result, 200);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const firstIssue = error.issues[0]?.message || "Invalid input data";
            return errorResponse(firstIssue, "INVALID_INPUT", 400);
        }
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e));
    }
}
