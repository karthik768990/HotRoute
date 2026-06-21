import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { GetUserDashboardOutput } from "@/lib/user-dashboard/user-dashboard.types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: GetUserDashboardOutput }>("/dashboard");
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
