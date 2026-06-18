import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { resendVerificationEmail } from "@/lib/auth/auth.service";

export async function POST(request: Request) {
    try {
        const jsonRequest = await request.json()
        const email = jsonRequest.email
        const result = await resendVerificationEmail({ email })
        return successResponse(result, 200)
    } catch (error: any) {
        return errorResponse(error.message, mapErrorToCode(error), mapErrorToStatus(error))
    }
}
