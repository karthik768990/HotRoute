import { getAllActiveProjects } from "./helpers/scheduler.projects";
import { Project } from "../../../generated/prisma/browser";
import { InMemoryQueue } from "../queue/queue.memory";


export function isProjectDueForPing(project: Project,date:Date):boolean{

    if(!project.lastPingAt)return true

    const futureTime =new Date(project.lastPingAt.getTime() + (project.interval*60)*1000) // interval: minutes
    if(date >= futureTime)return true

    return false;

}
export async function findProjectsDueForPing():Promise<Project[]> {
    const projects = await getAllActiveProjects()
    const now  = new  Date()
    return projects.filter(projects=> isProjectDueForPing(projects,now))
}


export async function enqueueDueProjects(queue: InMemoryQueue):Promise<void>{
    const dueProjects = await findProjectsDueForPing();
    if(dueProjects.length ===0 )return;
    for(const project of dueProjects){
        await queue.enqueue({projectId: project.id})
    }
}


