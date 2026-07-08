import { enqueueDueProjects } from "../core/scheduler/scheduler.service";
import { monitoringQueue } from "./queue";

const SCHEDULER_INTERVAL_MS = 60 * 1000; // 1 minute

let schedulerInterval: NodeJS.Timeout | null = null;

export function startScheduler() {
    if (schedulerInterval) {
        return;
    }

    schedulerInterval = setInterval(async () => {
        try {
            await enqueueDueProjects(monitoringQueue);
        } catch (error) {
            console.error("Error in scheduler loop:", error);
        }
    }, SCHEDULER_INTERVAL_MS);

    // Run once immediately on startup
    enqueueDueProjects(monitoringQueue).catch(error => {
        console.error("Error in initial scheduler run:", error);
    });
}
