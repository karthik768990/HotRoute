"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiClient } from "@/lib/api/client";
import { AxiosError } from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfileSettingsPage() {
  const { user, login } = useAuth();
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileValues) => {
    setProfileMessage(null);
    try {
      const response = await apiClient.patch("/user", data);
      if (response.data.success) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
        // Update local auth context
        const token = localStorage.getItem("hotroute_token");
        if (token) {
          login(token, response.data.data);
        }
      } else {
        setProfileMessage({ type: 'error', text: response.data.error || 'Failed to update profile.' });
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setProfileMessage({ type: 'error', text: axiosError.response?.data?.error || 'An unexpected error occurred.' });
    }
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    setPasswordMessage(null);
    try {
      const response = await apiClient.post("/user/password", data);
      if (response.data.success) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
        passwordForm.reset();
      } else {
        setPasswordMessage({ type: 'error', text: response.data.error || 'Failed to update password.' });
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setPasswordMessage({ type: 'error', text: axiosError.response?.data?.error || 'An unexpected error occurred.' });
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account identity and security.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>Update your display name and email address.</CardDescription>
          </CardHeader>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <CardContent className="space-y-4">
              {profileMessage && (
                <div className={`p-3 text-sm rounded-md ${profileMessage.type === 'success' ? 'bg-green-500/15 text-green-500' : 'bg-destructive/15 text-destructive'}`}>
                  {profileMessage.text}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Name</Label>
                <Input id="username" {...profileForm.register("username")} />
                {profileForm.formState.errors.username && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...profileForm.register("email")} />
                {profileForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to stay secure.</CardDescription>
          </CardHeader>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <div className={`p-3 text-sm rounded-md ${passwordMessage.type === 'success' ? 'bg-green-500/15 text-green-500' : 'bg-destructive/15 text-destructive'}`}>
                  {passwordMessage.text}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="secondary" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
