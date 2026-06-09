


import prisma from "../prisma";
import { generateJWTToken } from "./jwt";
import { hashPassword, verifyPassword } from "./password";
import { generateVerificationToken } from "./token";


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

interface LoginUserResponse {
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





export async function registerUser({
    name, email, password }: RegisterUserInput): Promise<RegisterUserResponse> {


    name = name.trim()
    email = email.trim().toLowerCase()
    password = password.trim()



    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    })

    if (existingUser) {
        throw new Error("Email already registered")
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
        data: {
            username: name,
            email, password: hashedPassword
        },
    })

    const token = generateVerificationToken()

    await prisma.verificationToken.create({
        data: {
            token,
            userId: user.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
        }
    })
    // TODO add the email sending after a while 


    return {
        id: user.id,
        username: user.username,
        email: user.email,
        verifiedAt: user.verifiedAt,
        createdAt: user.createdAt
    }
}


export async function loginUser({ email, password }: LoginUserInput): Promise<LoginUserResponse> {
    email = email.trim().toLowerCase()
    password = password.trim()
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    })
    if (!existingUser) {
        throw new Error("User does not exist")
    }
    const isEqual = await verifyPassword(password, existingUser?.password || '')
    if (!isEqual) {
        throw new Error("Invalid credentials")
    }
    const verificationDate = existingUser.verifiedAt
    if (!verificationDate) {
        throw new Error("User not verified his/her email")
    }
    const jwtToken = generateJWTToken(existingUser.id)
    return {
        accessToken: jwtToken,
        user: {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email
        }
    }
}




export async function verifyEmail({ token }: VerifyEmailInput): Promise<VerifyEmailResponse> {
    const existingToken = await prisma.verificationToken.findFirst({
        where: {
            token
        }
    }
    )
    if (!existingToken) {

        throw new Error("Token does not exist")

    }
    const currentTime = new Date()
    if (!(existingToken.expiresAt > currentTime))
        throw new Error("Token expired")
    const correspondingUserId = existingToken.userId
    const correspondingUser = await prisma.user.findUnique({
        where: {
            id: correspondingUserId
        }
    })
    if (!correspondingUser) {
        throw new Error("User failed")
    }
    await prisma.user.update({
        where: {
            id: correspondingUser.id
        },
        data: {
            verifiedAt: new Date()
        }
    })
    await prisma.verificationToken.delete({
        where: {
            token
        }
    })

    return {
        success: true
    }

}


export async function resendVerificationEmail({ email }: ResendVerificationInput): Promise<ResendVerificationResponse> {
    email = email.trim().toLowerCase()
    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    })
    if (!existingUser) {
        throw new Error("user does not exist")
    }
    const isNotVerified = !(existingUser.verifiedAt)
    if (!isNotVerified) {
        throw new Error("email already verified")
    }
    const latestToken = await prisma.verificationToken.findFirst({
        where: {
            userId: existingUser.id
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    const fiveMinutes = 5 * 60 * 1000

    if (
        latestToken &&
        Date.now() - latestToken.createdAt.getTime() < fiveMinutes
    ) {
        throw new Error("Please wait before requesting another email")
    }

    await prisma.verificationToken.deleteMany({
        where: {
            userId: existingUser.id
        }
    })

    const token = generateVerificationToken()

    await prisma.verificationToken.create({
        data: {
            token,
            userId: existingUser.id,
            expiresAt: new Date(
                Date.now() + 1000 * 60 * 60 * 24
            )
        }
    })

    // TODO:
    // await sendVerificationEmail(
    //     existingUser.email,
    //     token
    // )

    return {
        success: true
    }

}



// TODO : throw new InvalidCredentialsError()
// throw new UserAlreadyExistsError()
// throw new EmailNotVerifiedError()
// throw new CooldownError()

// TODO: forgotPassword() resetPassword() auth.service tests email-service integration 
