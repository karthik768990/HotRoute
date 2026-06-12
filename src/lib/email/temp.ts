import "dotenv/config"

console.log("API KEY: "+process.env.RESEND_API_KEY)
import { sendVerificationEmail } from "./email.service"

async function main(){
await sendVerificationEmail({
    email: "karthiktamarapalli5347@gmail.com",
    token: "test-token"
})
}

main()