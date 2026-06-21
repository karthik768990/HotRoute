"use client";

import { useState } from "react";
import { useProjects } from "@/lib/hooks/use-projects";
import { ProjectsTable } from "@/components/project/projects-table";
import { ProjectDrawer } from "@/components/project/project-drawer";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your endpoints and monitoring settings.</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center border rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error || !projects ? (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          Failed to load projects. Please try again.
        </div>
      ) : (
        <ProjectsTable projects={projects} />
      )}

      <ProjectDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        project={null}
      />
    </div>
  );
}
