import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register - HotRoute",
  description: "Create a new HotRoute account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <RegisterForm />
    </div>
  );
}
