interface VerificationEmailTemplate{
    subject:string,
    html:string
}
export  function generateVerificationEmail(verificationUrl:string):VerificationEmailTemplate{
   return {
        subject: "Verify your HotRoute account",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to HotRoute!</h2>

                <p>
                    Thank you for creating an account. Please verify your email
                    address by clicking the button below.
                </p>

                <p style="margin: 30px 0;">
                    <a
                        href="${verificationUrl}"
                        style="
                            background-color: #2563eb;
                            color: white;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 6px;
                            display: inline-block;
                        "
                    >
                        Verify Email
                    </a>
                </p>

                <p>
                    If the button doesn't work, copy and paste the following URL
                    into your browser:
                </p>

                <p>
                    <a href="${verificationUrl}">
                        ${verificationUrl}
                    </a>
                </p>

                <hr />

                <p style="color: #666; font-size: 14px;">
                    If you did not create an account, you can safely ignore this email.
                </p>
            </div>
        `,
    };
} 
