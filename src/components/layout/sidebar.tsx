"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, Folder, Settings, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Projects", href: "/dashboard/projects", icon: Folder },
  { name: "Settings", href: "/settings/profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background px-4 py-6">
      <Link href="/dashboard" className="flex items-center space-x-3 px-2 mb-8 hover:opacity-80 transition-opacity">
        <Logo className="h-6 w-6" />
        <span className="text-xl font-bold tracking-tight">HotRoute</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.href === "/dashboard"
                  ? pathname === "/dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  : (pathname === item.href || pathname.startsWith(`${item.href}/`))
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
