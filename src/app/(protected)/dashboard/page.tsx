"use client";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { RecentIncidents } from "@/components/dashboard/recent-incidents";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-6">
        <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md">
          Failed to load dashboard data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your monitoring infrastructure.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects">Manage Projects</Link>
        </Button>
      </div>

      <DashboardSummary summary={dashboard.summary} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RecentIncidents incidents={dashboard.recentIncidents} />
        </div>
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
               <Button variant="outline" className="w-full justify-start" asChild>
                 <Link href="/dashboard/projects">View All Projects</Link>
               </Button>
               <Button variant="outline" className="w-full justify-start" asChild>
                 <Link href="/settings/profile">Update Profile Settings</Link>
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
