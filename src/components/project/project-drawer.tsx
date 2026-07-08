/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useCreateProject, useUpdateProject } from "@/lib/hooks/use-projects";
import { Project } from "@/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

const projectSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  url: z.string().url({ message: "Please enter a valid URL (e.g. https://example.com)." }),
  interval: z.number().min(1, { message: "Interval must be at least 1 minute." }).max(60),
});


type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export function ProjectDrawer({ open, onOpenChange, project }: ProjectDrawerProps) {
  const isEditing = !!project;
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: updateProject } = useUpdateProject();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      url: "",
      interval: 5,
    },
  });

  useEffect(() => {
    if (open) {
      setError(null);
      if (project) {
        reset({
          name: project.name,
          url: project.url,
          interval: project.interval,
        });
      } else {
        reset({
          name: "",
          url: "",
          interval: 5,
        });
      }
    }
  }, [open, project, reset]);

  const onSubmit = async (data: ProjectFormValues) => {
    setError(null);
    try {
      if (isEditing) {
        await updateProject({
          projectId: project.id,
          ...data,
        });
      } else {
        await createProject(data);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const axiosError = err as import("axios").AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || "Failed to save project.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Project" : "Create Project"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update your project monitoring settings." : "Add a new project to start monitoring."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" placeholder="e.g. Production API" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Target URL</Label>
            <Input id="url" placeholder="https://api.example.com/health" {...register("url")} />
            {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Check Interval (minutes)</Label>
            <Input id="interval" type="number" min={1} max={60} {...register("interval", { valueAsNumber: true })} />
            {errors.interval && <p className="text-sm text-destructive">{errors.interval.message}</p>}
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
