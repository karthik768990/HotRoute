import { NextResponse } from "next/server";

export function successResponse<T>(
    data: T,
    statusCode: number = 200
) {
    return NextResponse.json(
        {
            success: true,
            data,
        },
        {
            status: statusCode,
        }
    );
}

export function errorResponse(
    message: string,
    code: string,
    statusCode: number
) {
    let sanitizedMessage = message;
    if (statusCode === 500 || code === 'INTERNAL_SERVER_ERROR') {
        console.error(`[Internal Server Error 500]`, message);
        sanitizedMessage = "An internal server error occurred";
    }

    return NextResponse.json(
        {
            success: false,
            error: {
                message: sanitizedMessage,
                code,
            },
        },
        {
            status: statusCode,
        }
    );
}