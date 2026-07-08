
import { errorResponse, successResponse } from "@/lib/api/api.response"
import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors"
import { verifyEmail } from "@/lib/auth/auth.service"

export async function POST(request: Request) {
    try {
        const requestBody = await request.json()
        const token: string = requestBody.token
        const result = await verifyEmail({ token })

        return successResponse(result, 200)

    } catch (error: unknown) {
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e))

    }
}