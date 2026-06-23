"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  Server, 
  Activity, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Plus, 
  Bell, 
  BarChart3,
  ArrowRight,
  FilterX
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type GlobalUserDashboardProps = {
  infrastructure: {
    totalProjects: number;
    activePercentage: number;
    onlineProjects: number;
    offlineProjects: number;
    overallUptime: number;
    globalAvgResponseTime: number;
  };
  recentIncidents: Array<{
    id: string;
    projectName: string;
    statusCode: number;
    message: string;
    timeAgo: string;
  }>;
  combinedHistory: Array<Record<string, any>>;
  projects: Array<{
    id: string;
    name: string;
    status: string; // 'UP' | 'DOWN' | 'UNKNOWN'
    active: boolean;
  }>;
};

type FilterState = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ONLINE' | 'OFFLINE';

const FILTERS: { label: string; value: FilterState }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Online', value: 'ONLINE' },
  { label: 'Offline', value: 'OFFLINE' },
];

const CHART_COLORS = [
  "#3b82f6", // Royal Blue
  "#10b981", // Emerald Green
  "#ec4899", // Neon Pink
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export function GlobalUserDashboard({
  infrastructure,
  recentIncidents,
  combinedHistory,
  projects,
}: GlobalUserDashboardProps) {
  const [filter, setFilter] = useState<FilterState>("ALL");

  // Filter derivations wrapped in useMemo for optimal performance
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filter === "ALL") return true;
      if (filter === "ACTIVE") return p.active;
      if (filter === "INACTIVE") return !p.active;
      if (filter === "ONLINE") return p.status === "UP";
      if (filter === "OFFLINE") return p.status === "DOWN";
      return true;
    });
  }, [projects, filter]);

  const filteredProjectNames = useMemo(() => filteredProjects.map(p => p.name), [filteredProjects]);

  const filteredIncidents = useMemo(() => {
    const validNames = new Set(filteredProjectNames);
    return recentIncidents.filter(inc => validNames.has(inc.projectName));
  }, [recentIncidents, filteredProjectNames]);

  // Determine global state based on UNFILTERED data for ambient glow, so it's always true to system health
  const isCritical = infrastructure.overallUptime < 90 || infrastructure.offlineProjects > 0;
  
  const ambientGlowClass = isCritical 
    ? "bg-red-500/5 shadow-[0_0_120px_rgba(220,38,38,0.15)]" 
    : "bg-blue-500/5 shadow-[0_0_120px_rgba(59,130,246,0.15)]";

  return (
    <div className="relative min-h-screen bg-white dark:bg-black p-6 md:p-10 overflow-hidden text-zinc-950 dark:text-zinc-50">
      {/* Global Ambient Glow */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${ambientGlowClass}`} />

      <motion.div
        className="relative z-10 space-y-8 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header Section with Filter UI */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Activity className={`h-8 w-8 ${isCritical ? "text-red-500" : "text-blue-500"}`} />
              <h1 className="text-4xl font-bold tracking-tight">Fleet Overview</h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              Global monitoring status for all your active projects.
            </p>
          </div>
          
          {/* The Filter UI: Sleek Pill Tabs */}
          <div className="flex flex-wrap items-center bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-full border border-border/50 shadow-inner">
            {FILTERS.map((f) => {
              const isActive = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 ${
                    isActive 
                      ? "text-zinc-900 dark:text-zinc-50" 
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="filter-active"
                      className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-full shadow-sm border border-black/5 dark:border-white/5"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Top Row: Navigation Stat Cards with secondary micro-metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/projects" className="block group">
              <Card className="h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Projects</CardTitle>
                  <Server className="h-4 w-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{infrastructure.totalProjects}</div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {infrastructure.activePercentage.toFixed(1)}% Active
                    </p>
                    <AnimatePresence mode="popLayout">
                      {filter !== "ALL" && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-[10px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded-full"
                        >
                          {filteredProjects.length} match filter
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/dashboard/projects?status=online" className="block group relative">
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 pointer-events-none rounded-xl" />
              <Card className="relative z-10 h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Online</CardTitle>
                  <Wifi className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {infrastructure.onlineProjects}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {infrastructure.totalProjects > 0 ? ((infrastructure.onlineProjects / infrastructure.totalProjects) * 100).toFixed(1) : 0}% of active
                    </p>
                    <AnimatePresence mode="popLayout">
                      {filter === "ONLINE" && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                          className="text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 px-2 py-0.5 rounded-full"
                        >
                          {filteredProjects.length} match filter
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/dashboard/projects?status=offline" className="block group relative">
              <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 animate-pulse pointer-events-none rounded-xl" />
              <Card className="relative z-10 h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 hover:border-red-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Offline</CardTitle>
                  <WifiOff className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-500">
                    {infrastructure.offlineProjects}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {infrastructure.totalProjects > 0 ? ((infrastructure.offlineProjects / infrastructure.totalProjects) * 100).toFixed(1) : 0}% of active
                    </p>
                    <AnimatePresence mode="popLayout">
                      {filter === "OFFLINE" && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                          className="text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 px-2 py-0.5 rounded-full"
                        >
                          {filteredProjects.length} match filter
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={`h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 shadow-sm relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl -mr-8 -mt-8 ${isCritical ? "bg-red-500/40" : "bg-emerald-500/40"}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Overall Health</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${isCritical ? "text-red-500" : "text-emerald-500"}`} />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-baseline gap-2">
                  <div className={`text-3xl font-bold ${isCritical ? "text-red-600 dark:text-red-500" : "text-emerald-600 dark:text-emerald-500"}`}>
                    {infrastructure.overallUptime.toFixed(2)}%
                  </div>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Avg Latency: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{infrastructure.globalAvgResponseTime}ms</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* The God's Eye Chart */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-900/20">
              <CardTitle className="text-xl font-medium flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-zinc-500" />
                "God's Eye" Response Times
              </CardTitle>
              <CardDescription>
                Synchronized latency tracking across filtered projects
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[400px] w-full relative">
                <AnimatePresence>
                  {filteredProjectNames.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px] rounded-md"
                    >
                      <FilterX className="h-10 w-10 text-zinc-400 mb-3" />
                      <p className="text-zinc-600 dark:text-zinc-300 font-medium">No projects match the current filter.</p>
                      <p className="text-sm text-zinc-500 mt-1">Try changing your filter settings to see response times.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800 opacity-50" />
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
                      tickFormatter={(value) => `${value}ms`}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "rgba(9, 9, 11, 0.9)", 
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                        padding: "12px"
                      }}
                      itemStyle={{ fontSize: "14px", fontWeight: 500, padding: "2px 0" }}
                      labelStyle={{ color: "#a1a1aa", marginBottom: "8px", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px" }}
                    />
                    {/* Only map over the filtered project names so untracked lines unmount and fade out */}
                    {filteredProjectNames.map((name, index) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={500}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Incidents Timeline */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 shadow-md flex flex-col">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg font-medium flex items-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Filtered Incidents Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative min-h-[350px]">
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredIncidents.length === 0 ? (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center h-full text-zinc-500 py-20"
                      >
                        <div className="bg-emerald-500/10 p-4 rounded-full mb-4">
                          <Activity className="h-8 w-8 text-emerald-500" />
                        </div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">All systems operational</p>
                        <p className="text-sm mt-1">No incidents match your current filter.</p>
                      </motion.div>
                    ) : (
                      filteredIncidents.map((incident, idx) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          key={incident.id} 
                          className="relative pl-6 pb-2 border-b border-border/50 last:border-0 last:pb-0"
                        >
                          {/* Timeline Connector */}
                          {idx !== filteredIncidents.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-[-20px] w-[2px] bg-border/50" />
                          )}
                          {/* Timeline Node */}
                          <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 ml-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 dark:bg-red-500/20 border-red-500/20 hover:bg-red-500/20 font-mono text-xs shadow-none">
                                  {incident.statusCode}
                                </Badge>
                                <span className="font-bold text-zinc-900 dark:text-zinc-50">{incident.projectName}</span>
                              </div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{incident.message}</p>
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-500 shrink-0 self-start sm:self-center font-medium">
                              {incident.timeAgo}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 shadow-md">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                <CardDescription>Manage your monitoring fleet</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button className="w-full justify-between group bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">
                  <span className="flex items-center"><Plus className="mr-2 h-4 w-4" /> Add New Project</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
                
                <Button variant="outline" className="w-full justify-between group border-border/50 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                  <span className="flex items-center"><Bell className="mr-2 h-4 w-4 text-amber-500" /> Manage Alerts</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
                
                <Button variant="outline" className="w-full justify-between group border-border/50 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                  <span className="flex items-center"><BarChart3 className="mr-2 h-4 w-4 text-emerald-500" /> View Global Reports</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
