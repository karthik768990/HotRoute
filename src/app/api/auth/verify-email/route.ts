
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { verifyEmail } from "@/lib/auth/auth.service";
import { verifyEmailSchema } from "@/lib/api/api.validation";
import { ZodError } from "zod";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const validated = verifyEmailSchema.parse(body);

        const result = await verifyEmail({ token: validated.token });
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