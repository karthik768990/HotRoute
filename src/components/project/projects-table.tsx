"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project } from "@/generated/prisma/browser";
import { ProjectDrawer } from "./project-drawer";
import { Play, Pause, Trash, Edit, Search, ActivitySquare, ArrowRight, Activity, Clock, Server, FolderSearch } from "lucide-react";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

import { useUpdateProject, useDeleteProject, ProjectWithMetrics } from "@/lib/hooks/use-projects";

export function ProjectsTable({ projects }: { projects: ProjectWithMetrics[] }) {
  const router = useRouter();
  const [editingProject, setEditingProject] = useState<ProjectWithMetrics | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: deleteProject } = useDeleteProject();

  const handleEdit = (e: React.MouseEvent, project: ProjectWithMetrics) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open) {
      setTimeout(() => setEditingProject(null), 300);
    }
  };

  const handleToggleActive = async (e: React.MouseEvent, project: ProjectWithMetrics) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateProject({
        projectId: project.id,
        active: !project.active,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  return (
    <>
      <div className="flex flex-col space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md group">
          <div className="absolute inset-0 bg-primary/10 rounded-md blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Search projects by name or URL..."
              className="pl-10 h-12 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-border/50 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {projects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md p-12 text-center"
              >
                <div className="absolute inset-0 bg-blue-500/5 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <ActivitySquare className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">No projects found</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                    You haven't added any endpoints to monitor yet. Create your first project to start tracking uptime and latency.
                  </p>
                </div>
              </motion.div>
            ) : filteredProjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md p-12 text-center"
              >
                <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                  <FolderSearch className="h-12 w-12 text-zinc-400" />
                  <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">No projects match your search.</p>
                </div>
              </motion.div>
            ) : (
              filteredProjects.map((project) => {
                // Calculate Metrics
                const logs = project.pingLogs || [];
                const successfulPings = logs.filter(l => l.success).length;
                const uptimePercent = logs.length > 0 ? ((successfulPings / logs.length) * 100).toFixed(1) : "0.0";
                
                const avgResponse = logs.length > 0 
                  ? Math.round(logs.reduce((acc, curr) => acc + curr.responseTime, 0) / logs.length) 
                  : 0;

                // Sparkline Data
                const sparklineData = [...logs].reverse().map((log, i) => ({
                  index: i,
                  latency: log.responseTime,
                }));

                const isOnline = logs.length > 0 ? logs[0].success : false;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={project.id}
                  >
                    <div 
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      className="group relative bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-border/50 rounded-2xl p-5 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row md:items-center gap-6"
                    >
                      {/* Ambient Glow behind card on hover */}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 pointer-events-none" />

                      {/* 1. Identity & Status */}
                      <div className="flex items-start md:items-center gap-4 min-w-[240px]">
                        <div className={`relative flex h-3 w-3 mt-1.5 md:mt-0 rounded-full ${!project.active ? "bg-zinc-400" : isOnline ? "bg-emerald-500" : "bg-red-500"}`}>
                          {project.active && (
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors line-clamp-1">
                            {project.name}
                          </h3>
                          <span className="text-xs text-zinc-500 font-mono line-clamp-1 mt-0.5">{project.url}</span>
                        </div>
                      </div>

                      {/* 2. Key Metrics */}
                      <div className="flex items-center gap-8 flex-1">
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Activity className="h-3 w-3"/> Uptime</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{logs.length > 0 ? `${uptimePercent}%` : "N/A"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3"/> Avg Latency</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{logs.length > 0 ? `${avgResponse}ms` : "N/A"}</span>
                        </div>
                        <div className="flex flex-col hidden sm:flex">
                          <span className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Server className="h-3 w-3"/> Interval</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{project.interval}m</span>
                        </div>
                      </div>

                      {/* 3. Mini Sparkline Chart */}
                      <div className="hidden lg:block w-[120px] h-[40px] opacity-60 group-hover:opacity-100 transition-opacity">
                        {sparklineData.length > 1 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparklineData}>
                              <Line 
                                type="monotone" 
                                dataKey="latency" 
                                stroke={!project.active ? "#a1a1aa" : isOnline ? "#10b981" : "#ef4444"} 
                                strokeWidth={2} 
                                dot={false} 
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                            No data
                          </div>
                        )}
                      </div>

                      {/* 4. Actions & Arrow */}
                      <div className="flex items-center gap-2 justify-end mt-4 md:mt-0">
                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                            onClick={(e) => handleToggleActive(e, project)}
                            title={project.active ? "Pause Monitoring" : "Resume Monitoring"}
                          >
                            {project.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100" onClick={(e) => handleEdit(e, project)} title="Edit Project">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={(e) => handleDelete(e, project.id)} title="Delete Project">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="h-8 w-8 flex items-center justify-center text-zinc-400 group-hover:text-primary transform translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      <ProjectDrawer
        open={isDrawerOpen}
        onOpenChange={handleDrawerClose}
        project={editingProject as any}
      />
    </>
  );
}
