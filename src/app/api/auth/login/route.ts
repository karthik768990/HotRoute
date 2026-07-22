import { errorResponse, successResponse } from "../../../../lib/api/api.response";
import { loginUser } from "../../../../lib/auth/auth.service";
import { mapErrorToCode, mapErrorToStatus } from "../../../../lib/api/api.errors";
import { applyRateLimit } from "../../../../lib/api/rate-limit";
import { loginSchema } from "../../../../lib/api/api.validation";
import { ZodError } from "zod";

export async function POST(request: Request) {
    const rateLimitError = applyRateLimit(request, "auth-login", 10, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    try {
        const body = await request.json().catch(() => ({}));
        const validated = loginSchema.parse(body);

        const result = await loginUser({ email: validated.email, password: validated.password });
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