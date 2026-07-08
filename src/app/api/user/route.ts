import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { requireAuthenticatedUser } from "@/lib/auth/auth.helper";
import { updateUserProfile } from "@/lib/user/user.service";

export async function PATCH(request: Request) {
    try {
        const user = await requireAuthenticatedUser(request);
        const jsonRequest = await request.json();
        
        const result = await updateUserProfile({
            userId: user.id,
            username: jsonRequest.username,
            email: jsonRequest.email
        });
        
        return successResponse(result, 200);
    } catch (error: unknown) {
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e));
    }
}
