import prisma from "../../../prisma";
import { Project } from "../../../../generated/prisma/browser";


export async function getAllActiveProjects():Promise<Project[]>{
    return  await  prisma.project.findMany({where: {active:  true}})
}
