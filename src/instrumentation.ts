export async function register() {
    // This hook runs during server boot
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { bootstrap } = await import("./lib/background/runtime/startup");
        await bootstrap();
    }
}
