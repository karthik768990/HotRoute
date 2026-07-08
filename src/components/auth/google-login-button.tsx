/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { apiClient } from "@/lib/api/client";
import { AxiosError } from "axios";
import { useAuth } from "@/providers/auth-provider";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export function GoogleLoginButton() {
  const router = useRouter();
  const { login } = useAuth();
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {

    setMounted(true);
  }, []);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      // Handle standard API wrapper response (data.success) or direct response
      const responseData = response.data.data || response.data;

      if (response.data.success !== false && responseData.accessToken) {
        login(responseData.accessToken, responseData.user);
        router.push("/dashboard");
      } else {
        setError(response.data.error || "Google login failed");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || "An unexpected error occurred during Google login.");
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError("Google login popup was closed or failed.");
  };

  if (!mounted) {
    return <div className="h-11 w-full bg-secondary/50 animate-pulse rounded-md mt-4"></div>;
  }

  return (
    <div className="w-full flex flex-col items-center space-y-5 mt-4 pt-2">
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-medium">OR</span>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex items-start gap-2 w-full">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="relative w-full flex justify-center items-center min-h-[44px]">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2 text-muted-foreground bg-secondary/50 py-2.5 px-4 rounded-md w-full border border-border/50 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Signing in with Google...</span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
              shape="rectangular"
              size="large"
              text="continue_with"
            />
          </div>
        )}
      </div>
    </div>
  );
}
