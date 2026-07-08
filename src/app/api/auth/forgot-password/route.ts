import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { forgotPassword } from "@/lib/auth/auth.service";

export async function POST(request: Request) {
    try {
        const jsonRequest = await request.json()
        const email = jsonRequest.email
        const result = await forgotPassword({ email })
        return successResponse(result, 200)

    } catch (error: unknown) {
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e))
    }
}