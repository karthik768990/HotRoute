import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login - HotRoute",
  description: "Login to your HotRoute account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <LoginForm />
    </div>
  );
}
