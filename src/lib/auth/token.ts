import { v4 as uuidv4 } from "uuid";


function generateVerificationToken():string{
    const token = uuidv4()
    return token;
}

function generatePasswordResetToken():string{
    const token = uuidv4()
    return token;
}

function generateExpiry(hours: number, currentTime: Date): Date {

    const futureTime = new Date(currentTime);

    futureTime.setHours(
        futureTime.getHours() + hours
    );

    return futureTime;
}

function  isTokenExpired(expiresAt:Date): boolean{
    const currentTime = new Date()
    return currentTime>expiresAt
}


export {generateVerificationToken,generateExpiry,isTokenExpired,generatePasswordResetToken}