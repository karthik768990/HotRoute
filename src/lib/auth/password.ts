import bcryptjs from "bcryptjs";

async function hashPassword(password:string): Promise<string>{
    password.trim()
    const saltRounds = 12
    try{
        const hashedPassword = await bcryptjs.hash(password,saltRounds)
        return hashedPassword
    }catch(error: any){
        throw new Error("Failed to hash password")
    }
}


async function verifyPassword(password: string,hashedPassword:string):Promise<boolean>{
    password
    try{
        const isMatch = await  bcryptjs.compare(password,hashedPassword);
        if(isMatch){
            return true;
        }
        return false;
    }catch(error: any){
        return false;
    }
}


export {hashPassword,verifyPassword}