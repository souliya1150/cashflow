import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: "green" | "red" | "blue" | "amber";
  animClass?: string;
}

const colorMap = {
  green: { accent: "var(--accent-green)", glow: "glow-green", bg: "rgba(0,230,118,0.08)" },
  red:   { accent: "var(--accent-red)",   glow: "glow-red",   bg: "rgba(255,82,82,0.08)"  },
  blue:  { accent: "var(--accent-blue)",  glow: "glow-blue",  bg: "rgba(68,138,255,0.08)" },
  amber: { accent: "var(--accent-amber)", glow: "",           bg: "rgba(255,171,64,0.08)" },
};

export default function StatCard({ label, value, sub, color = "blue", animClass }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={clsx("card p-5 flex flex-col gap-3", c.glow, animClass)}
      style={{ borderColor: c.accent + "33" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: c.accent }}
        />
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          {label}
        </p>
      </div>
      <p className="text-3xl font-semibold tracking-tight" style={{ color: c.accent }}>
        {value}
      </p>
      {sub && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}
