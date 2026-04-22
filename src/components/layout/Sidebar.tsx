"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ background: "var(--bg-card)", borderRight: "1px solid var(--bg-border)" }}
      className="fixed top-0 left-0 h-full w-56 flex flex-col z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-6 border-b" style={{ borderColor: "var(--bg-border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-green)" }}>
          <TrendingUp size={16} color="#0a0a0f" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>CashFlow</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Budget Tracker</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "text-white"
                  : "hover:bg-white/5"
              )}
              style={
                active
                  ? { background: "rgba(0,230,118,0.12)", color: "var(--accent-green)" }
                  : { color: "var(--text-secondary)" }
              }
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom hint */}
      <div className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)" }}>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--accent-green)", animation: "pulse-dot 2s infinite" }} />
          MongoDB Connected
        </div>
      </div>
    </aside>
  );
}
