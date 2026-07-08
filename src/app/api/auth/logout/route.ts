import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";

export async function POST() {
    try {
        // With JWT Bearer tokens, logout is purely a client-side operation
        // (removing the token from storage). This endpoint is provided for
        // API completeness or future cookie invalidation.
        return successResponse({ success: true, message: "Logged out successfully" }, 200);
    } catch (error: unknown) {
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e));
    }
}
