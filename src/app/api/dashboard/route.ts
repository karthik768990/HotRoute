import { requireAuthenticatedUser } from "@/lib/auth/auth.helper";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { getUserDashboard } from "@/lib/user-dashboard/user-dashboard.service";

export async function GET(request: Request) {
    try {
        const user = await requireAuthenticatedUser(request);

        const result = await getUserDashboard({
            userId: user.id
        });

        return successResponse(result, 200);
    } catch (error: any) {
        return errorResponse(
            error.message,
            mapErrorToCode(error),
            mapErrorToStatus(error)
        );
    }
}
