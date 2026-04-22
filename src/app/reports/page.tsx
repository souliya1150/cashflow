"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";

const CHART_COLORS = ["#448aff","#e040fb","#ffab40","#00bcd4","#ff7043","#66bb6a","#ec407a","#ab47bc","#26c6da","#ff5252","#00e676","#8888aa"];

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/reports?year=${year}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  useEffect(() => { load(); }, [year]);

  const expenseCategories = data?.categoryBreakdown?.filter((c: any) => c._id.type === "expense") || [];
  const incomeCategories  = data?.categoryBreakdown?.filter((c: any) => c._id.type === "income")  || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card p-3 text-xs" style={{ minWidth: 150 }}>
        <p className="font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card p-3 text-xs">
        <p style={{ color: "var(--text-primary)" }}>{payload[0].name}</p>
        <p style={{ color: payload[0].payload.fill }}>{formatCurrency(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <Shell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Reports</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Full year financial overview</p>
          </div>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ width: "auto", padding: "8px 12px" }}
          >
            {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Yearly totals */}
        {data && (
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-up-1">
            {[
              { label: "Total Income",  value: data.totals.income, color: "var(--accent-green)" },
              { label: "Total Expenses",value: data.totals.expense,color: "var(--accent-red)"   },
              { label: "Net Savings",   value: data.totals.net,    color: data.totals.net >= 0 ? "var(--accent-blue)" : "var(--accent-amber)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-5">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-3xl font-semibold" style={{ color, fontFamily: "DM Mono, monospace" }}>{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Monthly bar chart */}
        <div className="card p-5 mb-6 animate-fade-up-2">
          <p className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>Monthly Breakdown — {year}</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.monthlyData || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="monthName" tick={{ fill: "#8888aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8888aa", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income"  fill="#00e676" radius={[4,4,0,0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Expense" fill="#ff5252" radius={[4,4,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie charts */}
        <div className="grid grid-cols-2 gap-6 animate-fade-up-3">
          {/* Expense breakdown */}
          <div className="card p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Expense by Category</p>
            {expenseCategories.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No expense data</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={expenseCategories} dataKey="total" nameKey="_id.category" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                      {expenseCategories.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 flex flex-col gap-1.5">
                  {expenseCategories.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span style={{ color: "var(--text-secondary)" }}>{c._id.category}</span>
                      </div>
                      <span style={{ color: "var(--text-primary)", fontFamily: "DM Mono, monospace" }}>{formatCurrency(c.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Income breakdown */}
          <div className="card p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Income by Category</p>
            {incomeCategories.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No income data</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={incomeCategories} dataKey="total" nameKey="_id.category" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                      {incomeCategories.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 flex flex-col gap-1.5">
                  {incomeCategories.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span style={{ color: "var(--text-secondary)" }}>{c._id.category}</span>
                      </div>
                      <span style={{ color: "var(--text-primary)", fontFamily: "DM Mono, monospace" }}>{formatCurrency(c.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
