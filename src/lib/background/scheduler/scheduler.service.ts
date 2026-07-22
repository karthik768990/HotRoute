import prisma from "../../prisma";
import { Project } from "../../../generated/prisma/browser";
import { InMemoryQueue } from "../queue/queue.memory";

export async function findProjectsDueForPing():Promise<Project[]> {
    return await prisma.$queryRaw<Project[]>`
        SELECT *
        FROM "Project"
        WHERE
            active = true
        AND
        (
            "lastPingAt" IS NULL
            OR
            "lastPingAt" + ("interval" * INTERVAL '1 minute') <= NOW()
        );
    `;
}

export async function enqueueDueProjects(queue: InMemoryQueue):Promise<void>{
    const dueProjects = await findProjectsDueForPing();
    if(dueProjects.length ===0 )return;
    for(const project of dueProjects){
        await queue.enqueue({projectId: project.id})
    }
}

