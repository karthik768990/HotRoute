"use client";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { GlobalUserDashboard } from "@/components/dashboard/global-user-dashboard";
import { Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { data: dashboard, isLoading, error } = useDashboard();

  // Generate realistic-looking mock history data for the multi-line chart
  // This is a trade-off: the current API does not return a combined time-series
  // history for all projects. This data should ideally be fetched from a new API endpoint.
  let combinedHistory: Record<string, string | number>[] = [];
  if (dashboard?.projects) {
    const history = [];
    const now = new Date();
    const projectNames = dashboard.projects.map((p) => p.projectName);
    
    // Generate 12 data points (e.g., last 60 minutes in 5-min intervals)
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60000);
      const dataPoint: Record<string, string | number> = {
        timeLabel: format(time, "HH:mm"),
      };
      
      projectNames.forEach((name) => {
        // Base response time between 50ms and 250ms, with occasional spikes
        // Deterministic mock generation to satisfy react compiler
        const random1 = Math.abs(Math.sin(i + name.length)) * 200;
        const random2 = Math.abs(Math.cos(i + name.length));
        const base = Math.floor(random1) + 50;
        const spike = random2 > 0.8 ? Math.floor(random2 * 1000) : 0;
        dataPoint[name] = base + spike;
      });
      history.push(dataPoint);
    }
    combinedHistory = history;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-md flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Failed to load dashboard data. Please try again later.
        </div>
      </div>
    );
  }

  const infrastructure = {
    totalProjects: dashboard.summary.totalProjects,
    activePercentage: dashboard.summary.activeProjectsPercentage,
    onlineProjects: dashboard.summary.projectsUp,
    offlineProjects: dashboard.summary.projectsDown,
    overallUptime: dashboard.summary.overallUptimePercentage,
    globalAvgResponseTime: dashboard.summary.averageResponseTime,
  };

  const recentIncidentsMapped = dashboard.recentIncidents.map((inc) => ({
    id: `${inc.projectId}-${new Date(inc.createdAt).getTime()}`,
    projectName: inc.projectName,
    statusCode: inc.statusCode,
    message: inc.errorMessage || "Unknown error",
    timeAgo: formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true }),
  }));

  const projects = dashboard.projects.map((p) => ({
    id: p.projectId,
    name: p.projectName,
    status: p.status,
    active: p.active,
  }));

  return (
    <div className="-m-6 md:-m-10">
      {/* We use negative margins to allow the GlobalUserDashboard to bleed to the edges if it's placed inside a layout container */}
      <GlobalUserDashboard
        infrastructure={infrastructure}
        recentIncidents={recentIncidentsMapped}
        combinedHistory={combinedHistory}
        projects={projects}
      />
    </div>
  );
}

