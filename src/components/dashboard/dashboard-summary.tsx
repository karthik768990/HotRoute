"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildUserDashboardSummaryOutput } from "@/lib/dashboards/global/user-dashboard.types";
import { CheckCircle2, FolderDot, XCircle, Zap } from "lucide-react";

export function DashboardSummary({ summary }: { summary: BuildUserDashboardSummaryOutput }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:border-primary/50 transition-colors bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <FolderDot className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tighter">{summary.totalProjects}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-foreground font-medium">{summary.activeProjects}</span> active ({summary.activeProjectsPercentage.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>
      
      <Card className="hover:border-green-500/50 transition-colors bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Projects Online</CardTitle>
          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tighter text-green-500">{summary.projectsUp}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.projectsUpPercentage.toFixed(1)}% of active projects
          </p>
        </CardContent>
      </Card>

      <Card className="hover:border-destructive/50 transition-colors bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Projects Offline</CardTitle>
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <XCircle className="h-4 w-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tighter text-destructive">{summary.projectsDown}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.projectsDownPercentage.toFixed(1)}% of active projects
          </p>
        </CardContent>
      </Card>

      <Card className="hover:border-purple-500/50 transition-colors bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Overall Uptime</CardTitle>
          <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tighter">{summary.overallUptimePercentage.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg response: <span className="font-mono">{summary.averageResponseTime.toFixed(0)}ms</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
