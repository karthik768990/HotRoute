import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format")
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters")
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1, "Token is required")
});

export const resendVerificationSchema = z.object({
    email: z.string().email("Invalid email format")
});

export const updateProfileSchema = z.object({
    username: z.string().optional(),
    email: z.string().email("Invalid email format").optional()
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters")
});

export const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    url: z.string().min(1, "Project URL is required"),
    interval: z.number().int().positive("Interval must be a positive integer")
});

export const updateProjectSchema = z.object({
    name: z.string().optional(),
    url: z.string().optional(),
    interval: z.number().int().optional(),
    active: z.boolean().optional()
});
