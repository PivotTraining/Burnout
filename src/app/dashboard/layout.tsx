import Link from "next/link";
import { LayoutDashboard, BarChart3, Send, Users, Settings } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/pulse", label: "Pulse Surveys", icon: BarChart3 },
  { href: "/dashboard/nudges", label: "Manager Nudges", icon: Send },
  { href: "/dashboard/members", label: "Members", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-navy text-white">
        <div className="section-wide flex items-center justify-between h-14">
          <Link href="/dashboard" className="font-bold tracking-tight">
            BurnoutIQ <span className="text-ember">Console</span>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <span className="px-2 py-1 rounded bg-white/10">DEMO ORG</span>
            <Link href="/" className="text-white/70 hover:text-white">Exit ↗</Link>
          </div>
        </div>
      </header>
      <div className="section-wide py-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <nav className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy/70 hover:bg-white hover:text-ember transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
