interface PasswordResetEmailTemplate {
    subject: string;
    html: string;
}

export function generatePasswordResetEmail(
    resetUrl: string
): PasswordResetEmailTemplate {
    return {
        subject: "Reset your HotRoute password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>

                <p>
                    We received a request to reset the password for your HotRoute account.
                </p>

                <p>
                    Click the button below to choose a new password:
                </p>

                <p style="margin: 30px 0;">
                    <a
                        href="${resetUrl}"
                        style="
                            background-color: #2563eb;
                            color: white;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 6px;
                            display: inline-block;
                        "
                    >
                        Reset Password
                    </a>
                </p>

                <p>
                    If the button doesn't work, copy and paste the following URL
                    into your browser:
                </p>

                <p>
                    <a href="${resetUrl}">
                        ${resetUrl}
                    </a>
                </p>

                <hr />

                <p style="color: #666; font-size: 14px;">
                    This password reset link will expire after a limited time.
                </p>

                <p style="color: #666; font-size: 14px;">
                    If you did not request a password reset, you can safely ignore
                    this email. Your password will remain unchanged.
                </p>
            </div>
        `,
    };
}