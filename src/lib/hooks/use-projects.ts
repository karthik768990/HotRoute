import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Project } from "@/generated/prisma/browser";

export type ProjectWithMetrics = Project & {
  pingLogs?: Array<{
    id: string;
    success: boolean;
    responseTime: number;
    createdAt: string | Date;
  }>;
};

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: ProjectWithMetrics[] }>("/projects");
      return response.data.data;
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Project }>(`/projects/${projectId}`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; url: string; interval: number }) => {
      const response = await apiClient.post<{ success: boolean; data: Project }>("/projects", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...data }: { projectId: string; name?: string; url?: string; interval?: number; active?: boolean }) => {
      const response = await apiClient.patch<{ success: boolean; data: Project }>(`/projects/${projectId}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiClient.delete<{ success: boolean; data: unknown }>(`/projects/${projectId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
