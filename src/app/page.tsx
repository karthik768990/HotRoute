import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, ShieldCheck, Zap, BarChart3, ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "HotRoute - Premium Uptime Monitoring",
  description: "Enterprise-grade uptime monitoring with instant alerts.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Logo className="h-6 w-6" />
            <span>HotRoute</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Sign In
            </Link>
            <Button asChild className="rounded-full px-6">
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-32 xl:pb-36">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
          
          <div className="container mx-auto px-6 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
              Uptime monitoring for <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">modern infrastructure.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Stop finding out your services are down from your customers. Get instant, beautiful alerts and incredibly precise monitoring intervals with HotRoute.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="rounded-full h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
                <Link href="/register">
                  Start Monitoring Free <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full h-12 px-8 text-base hover:bg-white/5">
                <Link href="/login">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="py-24 sm:py-32 border-t border-white/5 bg-zinc-950/50">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to sleep soundly.</h2>
              <p className="mt-4 text-lg text-zinc-400">
                A premium feature-set designed for senior engineering teams who value reliability over complexity.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-xl">Sub-minute Polling</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Catch downtime the exact second it occurs. We constantly hit your endpoints without delays.
                </p>
              </div>

              <div className="flex flex-col gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-xl">Beautiful Analytics</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Understand your latency and uptime at a glance with intuitively designed dashboard visuals.
                </p>
              </div>

              <div className="flex flex-col gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-xl">Enterprise Security</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Stateless JWT sessions, strict payload validation, and military-grade encryption out of the box.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Logo className="h-5 w-5" />
            <span>HotRoute</span>
          </div>
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} HotRoute Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
