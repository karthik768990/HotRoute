import { successResponse } from "@/lib/api/api.response"

export async function GET() {
    return successResponse(
        {
            status: "ok",
            timestamp: new Date().toISOString()
        },
        200
    )
}