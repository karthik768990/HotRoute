"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentIncident } from "@/lib/user-dashboard/user-dashboard.types";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export function RecentIncidents({ incidents }: { incidents: RecentIncident[] }) {
  if (incidents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>All systems normal. No recent incidents recorded.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
        <CardDescription>Incidents reported across all your projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.map((incident, index) => (
            <div key={index} className="flex items-start space-x-4 border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="mt-0.5 rounded-full bg-destructive/10 p-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  <Link href={`/dashboard/projects/${incident.projectId}`} className="hover:underline text-primary">
                    {incident.projectName}
                  </Link>{" "}
                  experienced an outage
                </p>
                <p className="text-sm text-muted-foreground">
                  Status Code: {incident.statusCode} {incident.errorMessage ? `- ${incident.errorMessage}` : ""}
                </p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
