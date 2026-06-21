"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        const response = await apiClient.post("/auth/verify-email", { token });
        if (response.data.success) {
          setStatus("success");
          setMessage("Your email has been successfully verified!");
        } else {
          setStatus("error");
          setMessage(response.data.error || "Verification failed. The token may be invalid or expired.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.error || "An unexpected error occurred during verification.");
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="w-full max-w-md mx-auto mt-10 text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />}
          {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
          {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Email Verification</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center">
        {status === "success" || status === "error" ? (
          <Button asChild>
            <Link href="/login">Return to Login</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md mx-auto mt-10 text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
