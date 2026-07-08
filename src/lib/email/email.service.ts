import { generatePasswordResetEmail } from "./templates/password-reset-email"
import { generateVerificationEmail } from "./templates/verification-email"
import { resend } from "./resend"
interface SendVerificationEmailInput{
    email:string,
    token:string
}

export async function sendVerificationEmail({email,token}:SendVerificationEmailInput):Promise<void>{
    if(process.env.NODE_ENV==='test')return;



    const verificationURL = `${process.env.APP_URL}/verify-email?token=${encodeURIComponent(token)}`
    const verificationEmailContent = generateVerificationEmail(verificationURL)
    const sent= await resend.emails.send({
        from:"HotRoute <onboarding@resend.dev>",
        to: [`${email}`],
        subject:`${verificationEmailContent.subject}`,
        html:`${verificationEmailContent.html}`
    })

    if(sent.error){
        throw new Error("Something went wrong with the email service"+sent.error)
    }
    
}


interface SendPasswordResetEmailInput{
    email:string,
    token:string
}

export async function sendPasswordResetEmail({email,token}:SendPasswordResetEmailInput):Promise<void>{

    if(process.env.NODE_ENV==='test')return;


    const resetUrl = `${process.env.APP_URL}/reset-password?token=${encodeURIComponent(token)}`
    const resetPasswordMailContent = generatePasswordResetEmail(resetUrl)
    const sent = await resend.emails.send(
        {
            from:"HotRoute <onboarding@resend.dev>",
            to:[`${email}`],
            subject:`${resetPasswordMailContent.subject}`,
            html:`${resetPasswordMailContent.html}`
        }
    )

    if(sent.error){
        throw new Error("Email service error : "+sent.error.message)
    }
}  