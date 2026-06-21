"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project } from "@/generated/prisma/browser";
import { ProjectDrawer } from "./project-drawer";
import { Play, Pause, Trash, Edit, ChevronRight, Search, ActivitySquare } from "lucide-react";
import { useUpdateProject, useDeleteProject } from "@/lib/hooks/use-projects";

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: deleteProject } = useDeleteProject();

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open) {
      setTimeout(() => setEditingProject(null), 300);
    }
  };

  const handleToggleActive = async (project: Project) => {
    try {
      await updateProject({
        projectId: project.id,
        active: !project.active,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredProjects = projects.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Last Ping</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ActivitySquare className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-foreground">No projects found</p>
                    <p className="text-sm">Create a project to start monitoring your infrastructure.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No projects match your search query.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <Link href={`/dashboard/projects/${project.id}`} className="font-semibold hover:text-primary transition-colors flex items-center group-hover:underline">
                        {project.name}
                        <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-xs text-muted-foreground font-mono mt-0.5">{project.url}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.active ? (
                      <Badge variant="success" className="bg-green-500/15 text-green-500 hover:bg-green-500/25 border-transparent shadow-none">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-transparent shadow-none">Paused</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{project.interval}m</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {project.lastPingAt ? formatDistanceToNow(new Date(project.lastPingAt), { addSuffix: true }) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-background"
                        onClick={() => handleToggleActive(project)}
                        title={project.active ? "Pause Monitoring" : "Resume Monitoring"}
                      >
                        {project.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background" onClick={() => handleEdit(project)} title="Edit Project">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(project.id)} title="Delete Project">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectDrawer
        open={isDrawerOpen}
        onOpenChange={handleDrawerClose}
        project={editingProject}
      />
    </>
  );
}
