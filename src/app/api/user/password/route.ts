import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { requireAuthenticatedUser } from "@/lib/auth/auth.helper";
import { updateUserPassword } from "@/lib/user/user.service";
import { updatePasswordSchema } from "@/lib/api/api.validation";
import { ZodError } from "zod";

export async function POST(request: Request) {
    try {
        const user = await requireAuthenticatedUser(request);
        const body = await request.json().catch(() => ({}));
        const validated = updatePasswordSchema.parse(body);
        
        const result = await updateUserPassword({
            userId: user.id,
            currentPassword: validated.currentPassword,
            newPassword: validated.newPassword
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
