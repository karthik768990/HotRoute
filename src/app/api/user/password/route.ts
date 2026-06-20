import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { requireAuthenticatedUser } from "@/lib/auth/auth.helper";
import { updateUserPassword } from "@/lib/user/user.service";

export async function POST(request: Request) {
    try {
        const user = await requireAuthenticatedUser(request);
        const jsonRequest = await request.json();
        
        const result = await updateUserPassword({
            userId: user.id,
            currentPassword: jsonRequest.currentPassword,
            newPassword: jsonRequest.newPassword
        });
        
        return successResponse(result, 200);
    } catch (error: any) {
        return errorResponse(error.message, mapErrorToCode(error), mapErrorToStatus(error));
    }
}
