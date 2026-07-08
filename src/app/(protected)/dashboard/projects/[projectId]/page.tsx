"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Activity, Clock, CheckCircle2, AlertCircle, HelpCircle, 
  ShieldCheck, Loader2, Play, Pause, RefreshCw, ArrowLeft, 
  Globe, ShieldAlert, XCircle 
} from "lucide-react";
import Link from "next/link";

import { useProjectDashboard, useManualPing } from "@/lib/hooks/use-project-dashboard";
import { useProject, useUpdateProject } from "@/lib/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Components and Variants from suggested code ---
import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const pulseGlowVariants: Variants = {
  UP: {
    boxShadow: [
      "0 0 0px 0px rgba(16, 185, 129, 0)",
      "0 0 40px 10px rgba(16, 185, 129, 0.15)",
      "0 0 0px 0px rgba(16, 185, 129, 0)"
    ],
    transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
  },
  DOWN: {
    boxShadow: [
      "0 0 10px 5px rgba(220, 38, 38, 0.2)",
      "0 0 60px 20px rgba(220, 38, 38, 0.4)",
      "0 0 10px 5px rgba(220, 38, 38, 0.2)"
    ],
    transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
  },
  UNKNOWN: {
    boxShadow: "0 0 20px 5px rgba(100, 116, 139, 0.1)",
    transition: { duration: 0.5 }
  }
};

const CircularProgress = ({ value, color }: { value: number, color: string }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-16 w-16 -rotate-90 transform transition-all duration-1000 ease-out">
        <circle className="text-muted/20" strokeWidth="4" stroke="currentColor" fill="transparent" r={radius} cx="32" cy="32" />
        <circle className={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="32" cy="32" />
      </svg>
      <span className="absolute text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {value.toFixed(1)}%
      </span>
    </div>
  );
};

export default function ProjectDashboardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: dashboard, isLoading: dashboardLoading } = useProjectDashboard(projectId);
  const { mutateAsync: manualPing, isPending: isPinging } = useManualPing();
  const { mutateAsync: updateProject } = useUpdateProject();
  
  const [pingError, setPingError] = useState<string | null>(null);

  const chartData = !dashboard?.recentHistory ? [] : dashboard.recentHistory.map((item) => ({
    ...item,
    timeLabel: format(new Date(item.createdAt), "HH:mm"),
  }));

  const handleToggleActive = async () => {
    if (!project) return;
    try {
      await updateProject({ projectId: project.id, active: !project.active });
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualPing = async () => {
    setPingError(null);
    try {
      await manualPing(projectId);
    } catch (err: unknown) {
      const axiosError = err as import("axios").AxiosError<{ error?: string }>;
      setPingError(axiosError.response?.data?.error || "Failed to execute manual ping.");
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
          Failed to load project details. It may have been deleted or you don&apos;t have access.
        </p>
        <Button variant="outline" asChild className="mt-6">
          <Link href="/dashboard/projects">Return to Projects</Link>
        </Button>
      </div>
    );
  }

  const { summary, recentHistory, recentFailures } = dashboard;
  const isUp = summary.currentStatus === "UP";
  const isDown = summary.currentStatus === "DOWN";

  const statusColors = { UP: "text-emerald-500", DOWN: "text-red-500", UNKNOWN: "text-slate-500" };
  const statusIcons = {
    UP: <CheckCircle2 className={`h-8 w-8 ${statusColors.UP}`} />,
    DOWN: <AlertCircle className={`h-8 w-8 ${statusColors.DOWN}`} />,
    UNKNOWN: <HelpCircle className={`h-8 w-8 ${statusColors.UNKNOWN}`} />,
  };

  return (
    <motion.div
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border pb-8 relative z-10">
        <div className="flex items-start space-x-4">
          <Button variant="outline" size="icon" asChild className="mt-1 rounded-full border-border hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{project.name}</h1>
              {project.active ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none">Active</Badge>
              ) : (
                <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-none shadow-none">Paused</Badge>
              )}
            </div>
            <div className="flex items-center text-zinc-500 dark:text-zinc-400 mt-2 text-sm font-mono bg-zinc-100 dark:bg-zinc-900/50 px-2 py-1 rounded-md w-fit border border-border/50">
              <Globe className="mr-2 h-3 w-3" />
              <a href={project.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-500 transition-colors hover:underline">
                {project.url}
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleToggleActive} className="border-border/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            {project.active ? <Pause className="mr-2 h-4 w-4 text-zinc-500" /> : <Play className="mr-2 h-4 w-4 text-zinc-500" />}
            {project.active ? "Pause Monitoring" : "Resume Monitoring"}
          </Button>
          <Button 
            onClick={handleManualPing} 
            disabled={isPinging || !project.active} 
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
          >
            {isPinging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Manual Ping
          </Button>
        </div>
      </motion.div>

      {pingError && (
        <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg flex items-center">
          <XCircle className="mr-2 h-5 w-5" />
          {pingError}
        </motion.div>
      )}

      {/* Top Row: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card with Dynamic Glow */}
        <motion.div variants={itemVariants} className="relative group">
          <motion.div
            className="absolute inset-0 rounded-xl z-0 pointer-events-none"
            variants={pulseGlowVariants}
            animate={!project.active ? "UNKNOWN" : summary.currentStatus}
          />
          <Card className="relative z-10 h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Current Status
              </CardTitle>
              <Activity className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {!project.active ? statusIcons.UNKNOWN : statusIcons[summary.currentStatus]}
                <div>
                  <div className={`text-2xl font-bold tracking-tight ${!project.active ? statusColors.UNKNOWN : statusColors[summary.currentStatus]}`}>
                    {!project.active ? "PAUSED" : summary.currentStatus}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {!project.active ? "Monitoring is paused" : isUp ? "All systems operational" : isDown ? "Incident ongoing" : "Checking status..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Uptime Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Overall Uptime
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {summary.uptimePercentage.toFixed(2)}%
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Last 30 days</p>
              </div>
              <CircularProgress 
                value={summary.uptimePercentage} 
                color={summary.uptimePercentage >= 99 ? "text-emerald-500" : summary.uptimePercentage >= 95 ? "text-amber-500" : "text-red-500"} 
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Avg Response Time Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {summary.averageResponseTime.toFixed(0)}ms
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Global average latency</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 overflow-hidden shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Response Time History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  Waiting for first ping to generate chart data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} className="dark:stop-color-[#3b82f6]" />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} className="dark:stop-color-[#3b82f6]" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="currentColor" 
                      className="text-zinc-200 dark:text-zinc-800 opacity-50" 
                    />
                    <XAxis 
                      dataKey="timeLabel" 
                      stroke="currentColor" 
                      className="text-zinc-500 text-xs" 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="currentColor" 
                      className="text-zinc-500 text-xs" 
                      tickLine={false} 
                      axisLine={false} 
                      width={50}
                      tickFormatter={(value) => `${value}ms`}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "rgba(9, 9, 11, 0.9)", 
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                      }}
                      itemStyle={{ color: "#3b82f6" }}
                      labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#2563eb"
                      className="dark:stroke-[#3b82f6]"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorResponseTime)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Pings & Failures Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-border/50">
              <CardTitle className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Recent Pings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="pl-6">Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Response</TableHead>
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
                    [...recentHistory].reverse().slice(0, 10).map((log) => (
                      <TableRow key={log.id} className="border-border/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <TableCell className="font-medium text-zinc-500 dark:text-zinc-400 pl-6">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 w-fit px-2 py-0.5 rounded text-xs">
                              <CheckCircle2 className="mr-1.5 h-3 w-3" /> {log.statusCode} OK
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 dark:text-red-400 font-medium bg-red-500/10 w-fit px-2 py-0.5 rounded text-xs">
                              <XCircle className="mr-1.5 h-3 w-3" /> {log.statusCode || 'ERR'}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-zinc-900 dark:text-zinc-50 pr-6">
                          {log.responseTime}ms
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 shadow-sm overflow-hidden flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
            <CardHeader className="bg-red-500/5 dark:bg-red-500/10 border-b border-red-500/10">
              <CardTitle className="text-lg font-medium text-red-600 dark:text-red-400 flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5" />
                Recent Incidents Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto max-h-[400px]">
              {recentFailures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                    <ShieldCheck className="h-16 w-16 text-emerald-500 relative z-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    All Systems Operational
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-[250px] text-sm">
                    No recent failures or incidents detected. Your services are routing hot and fast.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {recentFailures.slice(0, 5).map((failure) => (
                    <div key={failure.id} className="flex flex-col space-y-2 border-b border-red-500/10 p-6 last:border-0 hover:bg-red-500/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="destructive" 
                          className="bg-red-500/10 text-red-600 dark:text-red-400 dark:bg-red-500/20 hover:bg-red-500/20 border-red-500/20 shadow-none"
                        >
                          Error {failure.statusCode || "N/A"}
                        </Badge>
                        <span className="text-xs font-mono text-red-600/70 dark:text-red-400/70">
                          {format(new Date(failure.createdAt), 'MMM d, yyyy • HH:mm:ss')}
                        </span>
                      </div>
                      {failure.errorMessage && (
                        <div className="text-sm text-red-700 dark:text-red-300 bg-white dark:bg-black/40 p-3 rounded-md font-mono border border-red-500/20 break-all shadow-inner">
                          {failure.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
