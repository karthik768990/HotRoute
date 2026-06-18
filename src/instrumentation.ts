import { bootstrap } from "./lib/runtime/startup";

export async function register() {
    // This hook runs during server boot
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await bootstrap();
    }
}
