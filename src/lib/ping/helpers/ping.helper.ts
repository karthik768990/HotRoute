const REQUEST_TIMEOUT_MS = 80000; // new timeout to tackle tthe slowest responses from platforms like render
const SUCCESS_STATUS_MIN = 200
const SUCCESS_STATUS_MAX = 399;

import { request } from "undici"
import { CreatePingLogInput, ExecutePingInput, ExecutePingOutput } from "./ping.helpers.types";
import { PingLog } from "@/generated/prisma/browser";
import prisma from "../../prisma"

function isSuccessStatus(statusCode: number): boolean {
    return statusCode >= SUCCESS_STATUS_MIN && statusCode <= SUCCESS_STATUS_MAX
}


export async function executePing({ url }: ExecutePingInput): Promise<ExecutePingOutput> {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
        controller.abort()
    }, REQUEST_TIMEOUT_MS)

    const start = performance.now()
    try {
        const response = await request(url, {
            method: "GET",
            signal: controller.signal,
            // maxRedirections: 5
        })

        const statusCode = response.statusCode
        await response.body.dump()
        const end = performance.now()

        clearTimeout(timeout)
        const responseTime = Math.round(end - start)
        
        return {
            statusCode: statusCode,
            responseTime,
            success: isSuccessStatus(statusCode),
            errorMessage: null
        }
    } catch (error) {
        let errorMessage: string = 'Unknown error'
        if(error instanceof Error){
            if(error.message === 'AbortError'){
                errorMessage = "Request Timeout"
            }else{
                errorMessage =error.message
            }
        }
        const end = performance.now()
        clearTimeout(timeout)

        const responseTime = Math.round(end - start)
        return {
            statusCode: null,
            responseTime,
            success: false,
            errorMessage: errorMessage
        }
    }
}


export async function createPingLog({
    projectId,
    statusCode,
    responseTime,
    success,
    errorMessage }: CreatePingLogInput): Promise<PingLog> {
        const createdLog = await prisma.pingLog.create({
            data:{
                projectId: projectId,
                statusCode:statusCode,
                responseTime: responseTime,
                success: success,
                errorMessage: errorMessage
            }
        })
        return createdLog

}
