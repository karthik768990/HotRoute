import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password - HotRoute",
  description: "Reset your HotRoute password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <ForgotPasswordForm />
    </div>
  );
}
