import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { requireAuthenticatedUser } from "@/lib/auth/auth.helper";
import { createProject, listProjects } from "@/lib/projects/project.service";
import { createProjectSchema } from "@/lib/api/api.validation";
import { ZodError } from "zod";

export async function GET(request: Request) {
    try {
        const user = await requireAuthenticatedUser(request);

        const result = await listProjects({ userId: user.id });
        return successResponse(result, 200);
    } catch (error: unknown) {
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e));
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAuthenticatedUser(request);
        const body = await request.json().catch(() => ({}));
        const validated = createProjectSchema.parse(body);

        const result = await createProject({
            userId: user.id,
            name: validated.name,
            url: validated.url,
            interval: validated.interval
        });
        return successResponse(result, 201);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const firstIssue = error.issues[0]?.message || "Invalid input data";
            return errorResponse(firstIssue, "INVALID_INPUT", 400);
        }
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e));
    }
}