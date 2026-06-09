import jwt from "jsonwebtoken"


interface JWTPayLoad {
    userId: string
}


function generateJWTToken(userId: string): string {
    const secret = process.env.JWT_SECRET_KEY
    if (!secret) {
        throw new Error("JWT KEY is not configured in .env")
    }
    const token = jwt.sign({
        userId
    }, secret, {
        expiresIn: '7d'
    })
    return token
}


function verifyToken(token: string): JWTPayLoad {
    const secret = process.env.JWT_SECRET_KEY
    if (!secret) {
        throw new Error("JWT KEY is not configured in .env")
    }

    const decoded = jwt.verify(token, secret)
    return decoded as JWTPayLoad
}


export {
    generateJWTToken, verifyToken
}