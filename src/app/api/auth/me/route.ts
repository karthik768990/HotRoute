import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { requireAuthenticatedUser } from "@/lib/auth/auth.helper";

export async function GET(request: Request) {
    try {
        const user = await requireAuthenticatedUser(request);
        return successResponse({
            id: user.id,
            username: user.username,
            email: user.email,
            verifiedAt: user.verifiedAt,
            createdAt: user.createdAt
        }, 200);
    } catch (error: unknown) {
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e));
    }
}
