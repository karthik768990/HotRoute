import { AlreadyVerifiedError, InvalidCredentialsError, UserAlreadyExistsError, UserNotFoundError, UserNotVerifiedError } from "../projects/helpers/project.errors";
import { sendPasswordResetEmail, sendVerificationEmail } from "../email/email.service";
import prisma from "../prisma";
import { InvalidGoogleTokenError, OAuthAccountRequiredError, TokenDoesNotExistError, TokenExpiredError } from "./google/helpers/google.errors";
import { generateJWTToken } from "./jwt";
import { hashPassword, verifyPassword } from "./password";
import { generatePasswordResetToken, generateVerificationToken } from "./token";


interface RegisterUserInput {
    name: string
    email: string
    password: string
}

interface RegisterUserResponse {
    id: string,
    username: string,
    email: string,
    verifiedAt: Date | null,
    createdAt: Date
}
interface LoginUserInput {
    email: string,
    password: string
}

export interface LoginUserResponse {
    accessToken: string,
    user: {
        id: string,
        username: string,
        email: string
    }
}

interface VerifyEmailInput {
    token: string
}

interface VerifyEmailResponse {
    success: boolean
}

interface ResendVerificationInput {
    email: string
}
interface ResendVerificationResponse {
    success: boolean
}


interface ForgotPasswordInput {
    email: string
}

interface ForgotPasswordResponse {
    success: boolean
}


interface ResetPasswordInput {
    token: string,
    newPassword: string

}


interface ResetPasswordResponse {
    success: boolean
}

function validateLocalAuthAllowed(user: { password?: string | null, googleId?: string | null }, errorMessage: string): void {
    if (!user.password && user.googleId) {
        throw new OAuthAccountRequiredError(errorMessage);
    }
}

function validateTokenRateLimit(latestTokenCreatedAt?: Date, errorMessage?: string): void {
    const fiveMinutes = 5 * 60 * 1000;
    if (latestTokenCreatedAt && Date.now() - latestTokenCreatedAt.getTime() < fiveMinutes) {
        throw new Error(errorMessage || "Please wait before requesting another email");
    }
}

function sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

async function generateAndSaveVerificationToken(userId: string): Promise<string> {
    await prisma.verificationToken.deleteMany({ where: { userId } });
    
    const token = generateVerificationToken();
    await prisma.verificationToken.create({
        data: {
            token,
            userId,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
        }
    });
    
    return token;
}

async function generateAndSavePasswordResetToken(userId: string): Promise<string> {
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
    
    const token = generatePasswordResetToken();
    await prisma.passwordResetToken.create({
        data: {
            token,
            userId,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
        }
    });
    
    return token;
}


export async function registerUser({
    name, email, password }: RegisterUserInput): Promise<RegisterUserResponse> {

    name = name.trim();
    email = sanitizeEmail(email);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new UserAlreadyExistsError('user already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            username: name,
            email, 
            password: hashedPassword
        },
    });

    const token = await generateAndSaveVerificationToken(user.id);

    await sendVerificationEmail({ email: user.email, token });

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        verifiedAt: user.verifiedAt,
        createdAt: user.createdAt
    };
}


export async function loginUser({ email, password }: LoginUserInput): Promise<LoginUserResponse> {
    email = sanitizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        throw new InvalidCredentialsError("Invaliid credentials");
    }
    
    validateLocalAuthAllowed(user, "This account uses Google Sign-In. Please log in with Google.");
    
    const isEqual = await verifyPassword(password, user?.password || '');
    if (!isEqual) {
        throw new InvalidCredentialsError("Invaliid credentials");
    }
    
    if (!user.verifiedAt) {
        throw new UserNotVerifiedError('User not verified his/her email');
    }
    
    const jwtToken = generateJWTToken(user.id);
    
    return {
        accessToken: jwtToken,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    };
}




export async function verifyEmail({ token }: VerifyEmailInput): Promise<VerifyEmailResponse> {
    const existingToken = await prisma.verificationToken.findFirst({
        where: { token }
    });
    
    if (!existingToken) {
        throw new TokenDoesNotExistError('Token does not exist');
    }
    
    if (!(existingToken.expiresAt > new Date())) {
        throw new TokenExpiredError("Token expired");
    }
        
    const user = await prisma.user.findUnique({
        where: { id: existingToken.userId }
    });
    
    if (!user) {
        throw new UserNotFoundError("User not found");
    }
    
    await prisma.user.update({
        where: { id: user.id },
        data: { verifiedAt: new Date() }
    });
    
    await prisma.verificationToken.delete({
        where: { token }
    });

    return { success: true };
}


export async function resendVerificationEmail({ email }: ResendVerificationInput): Promise<ResendVerificationResponse> {
    email = sanitizeEmail(email);
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        throw new UserNotFoundError("user does not exist");
    }
    
    validateLocalAuthAllowed(user, "This account uses Google Sign-In and is already verified.");
    
    if (user.verifiedAt) {
        throw new AlreadyVerifiedError("email already verified");
    }
    
    const latestToken = await prisma.verificationToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
    });
    
    validateTokenRateLimit(latestToken?.createdAt, "Please wait before requesting another email");

    const token = await generateAndSaveVerificationToken(user.id);

    await sendVerificationEmail({
        email: user.email,
        token
    });

    return { success: true };
}




export async function forgotPassword({ email }: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    email = sanitizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return { success: true };
    }
    
    validateLocalAuthAllowed(user, "This account uses Google Sign-In. Password reset is not available.");
    
    const latestToken = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
    });

    validateTokenRateLimit(latestToken?.createdAt, "Please wait before requesting another password reset email");

    const token = await generateAndSavePasswordResetToken(user.id);

    await sendPasswordResetEmail({
        email: user.email,
        token
    });

    return { success: true };
}

export async function resetPassword({
    token,
    newPassword
}: ResetPasswordInput): Promise<ResetPasswordResponse> {

    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { token },
    });

    if (!existingToken) {
        throw new InvalidGoogleTokenError("Invalid token");
    }

    if (existingToken.expiresAt <= new Date()) {
        throw new TokenExpiredError('Token expired');
    }
    
    const newHashedPassword = await hashPassword(newPassword);

    const userId = existingToken.userId;

    if (!userId) {
        throw new UserNotFoundError("user not found");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { password: newHashedPassword }
    });

    await prisma.passwordResetToken.delete({
        where: { token: token }
    });

    return { success: true };
}



