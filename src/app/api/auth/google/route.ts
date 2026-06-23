import { NextResponse } from "next/server";
import { loginWithGoogle } from "@/lib/auth/google/google.service";
import { InvalidGoogleTokenError } from "@/lib/auth/google/helpers/google.errors";
import { generateJWTToken } from "@/lib/auth/jwt";
import { LoginUserResponse } from "@/lib/auth/auth.service";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { credential } = body;

        // 1. Validate Input
        if (!credential || typeof credential !== "string") {
            return NextResponse.json(
                { error: "Google credential is required" },
                { status: 400 }
            );
        }

        // 2. Sync with database and get the user
        const user = await loginWithGoogle({ credential });

        // 3. Generate your standard HotRoute JWT
        const accessToken =  generateJWTToken(user.id );

        // 4. Construct the exact response shape your frontend expects
        const responsePayload: LoginUserResponse = {
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };

        // 5. Build response
        return successResponse(responsePayload,200)
        // Optional: If you also use HttpOnly cookies alongside the JSON payload, 
        // you would attach it here before returning.
        // setSessionCookie(response, accessToken);


    } catch (error: any) {
        return errorResponse(error.message,mapErrorToCode(error),mapErrorToStatus(error))
    }
}