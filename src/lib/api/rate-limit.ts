import { errorResponse } from "./api.response";

interface RateLimitRecord {
    timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
    key: string,
    maxRequests: number = 10,
    windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitMap.get(key) || { timestamps: [] };
    
    // Filter timestamps within sliding window
    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
        return { allowed: false, remaining: 0 };
    }

    record.timestamps.push(now);
    rateLimitMap.set(key, record);

    return {
        allowed: true,
        remaining: maxRequests - record.timestamps.length
    };
}

export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp.trim();
    }
    return "127.0.0.1";
}

export function applyRateLimit(
    request: Request,
    routeKey: string,
    maxRequests: number = 10,
    windowMs: number = 60 * 1000
) {
    const ip = getClientIp(request);
    const key = `${routeKey}:${ip}`;
    const { allowed } = checkRateLimit(key, maxRequests, windowMs);

    if (!allowed) {
        return errorResponse("Too many requests. Please try again later.", "TOO_MANY_REQUESTS", 429);
    }
    return null;
}
