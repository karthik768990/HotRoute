"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterValues) => {
    setError(null);
    try {
      const response = await apiClient.post("/auth/register", data);
      if (response.data.success) {
        router.push("/login?registered=true");
      } else {
        setError(response.data.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 shadow-lg border-border/50 bg-card/60 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">
          Enter your information to get started with HotRoute
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {error && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground/80">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              className="focus-visible:ring-primary/50 h-11"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="focus-visible:ring-primary/50 h-11"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground/80">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="focus-visible:ring-primary/50 h-11 pr-10"
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle password visibility</span>
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-11 text-base shadow-md shadow-primary/20 transition-all hover:shadow-primary/40" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign Up
          </Button>
          <GoogleLoginButton />
          <div className="text-sm text-center text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
