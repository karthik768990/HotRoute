import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { GetProjectDashboardOutput } from "@/lib/dashboards/project/dashboard.types";

export function useProjectDashboard(projectId: string) {
  return useQuery({
    queryKey: ["projectDashboard", projectId],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: GetProjectDashboardOutput }>(`/projects/${projectId}/dashboard`);
      return response.data.data;
    },
    refetchInterval: 30000,
    enabled: !!projectId,
  });
}

export function useManualPing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiClient.post<{ success: boolean; data: unknown }>(`/projects/${projectId}/ping`);
      return response.data;
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["projectDashboard", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
