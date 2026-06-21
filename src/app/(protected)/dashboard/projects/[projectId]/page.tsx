"use client";

import { use, useState } from "react";
import { useProjectDashboard, useManualPing } from "@/lib/hooks/use-project-dashboard";
import { useProject, useUpdateProject } from "@/lib/hooks/use-projects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Play, Pause, RefreshCw, ArrowLeft, CheckCircle2, XCircle, Activity, Globe, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default function ProjectDashboardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: dashboard, isLoading: dashboardLoading } = useProjectDashboard(projectId);
  const { mutateAsync: manualPing, isPending: isPinging } = useManualPing();
  const { mutateAsync: updateProject } = useUpdateProject();
  
  const [pingError, setPingError] = useState<string | null>(null);

  const handleToggleActive = async () => {
    if (!project) return;
    try {
      await updateProject({
        projectId: project.id,
        active: !project.active,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualPing = async () => {
    setPingError(null);
    try {
      await manualPing(projectId);
    } catch (err: any) {
      setPingError(err.response?.data?.error || "Failed to execute manual ping.");
    }
  };

  if (projectLoading || dashboardLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project || !dashboard) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Project Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Failed to load project details. It may have been deleted or you don't have access.
        </p>
        <Button variant="outline" asChild className="mt-6">
          <Link href="/dashboard/projects">Return to Projects</Link>
        </Button>
      </div>
    );
  }

  const { summary, recentHistory, recentFailures } = dashboard;

  const statusColor = !project.active 
    ? "bg-zinc-500" 
    : summary.currentStatus === 'UP' 
      ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
      : "bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]";

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border pb-8">
        <div className="flex items-start space-x-4">
          <Button variant="outline" size="icon" asChild className="mt-1 rounded-full border-border hover:bg-muted/50">
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${statusColor} animate-pulse`} />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
              {project.active ? (
                <Badge variant="success" className="bg-green-500/15 text-green-500 border-none shadow-none">Active</Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-none shadow-none">Paused</Badge>
              )}
            </div>
            <div className="flex items-center text-muted-foreground mt-2 text-sm font-mono bg-muted/30 px-2 py-1 rounded-md w-fit border border-border">
              <Globe className="mr-2 h-3 w-3" />
              <a href={project.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors hover:underline">
                {project.url}
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleToggleActive} className="border-border hover:bg-muted/50">
            {project.active ? <Pause className="mr-2 h-4 w-4 text-muted-foreground" /> : <Play className="mr-2 h-4 w-4 text-muted-foreground" />}
            {project.active ? "Pause Monitoring" : "Resume Monitoring"}
          </Button>
          <Button onClick={handleManualPing} disabled={isPinging || !project.active} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
            {isPinging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Manual Ping
          </Button>
        </div>
      </div>

      {pingError && (
        <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm p-4 rounded-lg flex items-center">
          <XCircle className="mr-2 h-5 w-5" />
          {pingError}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border hover:border-primary/30 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime (30d)</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tighter text-foreground">
              {summary.uptimePercentage.toFixed(2)}<span className="text-2xl text-muted-foreground">%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-card/50 border-border hover:border-primary/30 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tighter text-foreground">
              {summary.averageResponseTime.toFixed(0)}<span className="text-2xl text-muted-foreground">ms</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-card/50 border-border hover:border-primary/30 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Check Interval</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tighter text-foreground">
              {project.interval}<span className="text-2xl text-muted-foreground">m</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Pings Table */}
        <Card className="border-border shadow-sm overflow-hidden flex flex-col h-full bg-card/40">
          <CardHeader className="border-b border-border bg-muted/30">
            <CardTitle className="text-lg">Recent Pings</CardTitle>
            <CardDescription>Real-time log of the latest successful and failed checks.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="border-border">
                  <TableHead className="pl-6">Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentHistory.length === 0 ? (
                  <TableRow className="border-none hover:bg-transparent">
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                      Waiting for first ping...
                    </TableCell>
                  </TableRow>
                ) : (
                  recentHistory.slice(0, 10).map((log) => (
                    <TableRow key={log.id} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm text-muted-foreground pl-6">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <div className="flex items-center text-green-500 font-medium bg-green-500/10 w-fit px-2 py-0.5 rounded text-xs">
                            <CheckCircle2 className="mr-1.5 h-3 w-3" /> {log.statusCode} OK
                          </div>
                        ) : (
                          <div className="flex items-center text-destructive font-medium bg-destructive/10 w-fit px-2 py-0.5 rounded text-xs">
                            <XCircle className="mr-1.5 h-3 w-3" /> {log.statusCode || 'ERR'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-foreground pr-6">
                        {log.responseTime}ms
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Failures List */}
        <Card className="border-destructive/20 shadow-sm overflow-hidden flex flex-col h-full bg-destructive/5 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-destructive/50 to-transparent"></div>
          <CardHeader className="border-b border-destructive/10 bg-transparent">
            <CardTitle className="text-lg text-destructive flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5" />
              Incident History
            </CardTitle>
            <CardDescription className="text-destructive/70">Historical record of recorded outages.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {recentFailures.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-sm text-muted-foreground space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500/50" />
                <span>Flawless uptime. No recent failures.</span>
              </div>
            ) : (
              <div className="flex flex-col">
                {recentFailures.slice(0, 5).map((failure) => (
                  <div key={failure.id} className="flex flex-col space-y-2 border-b border-destructive/10 p-6 last:border-0 hover:bg-destructive/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="border-none">Error {failure.statusCode || "N/A"}</Badge>
                      </div>
                      <span className="text-xs font-mono text-destructive/70">
                        {format(new Date(failure.createdAt), 'MMM d, yyyy • HH:mm:ss')}
                      </span>
                    </div>
                    {failure.errorMessage && (
                      <div className="text-sm text-destructive/90 bg-black/40 p-3 rounded-md font-mono border border-destructive/20 break-all">
                        {failure.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
