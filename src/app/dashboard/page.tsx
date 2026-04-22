"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import StatCard from "@/components/ui/StatCard";
import TransactionModal from "@/components/ui/TransactionModal";
import { formatCurrency, formatDate, getCurrentMonth, getMonthLabel } from "@/lib/utils";
import { Transaction } from "@/types";
import { Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Pencil, Trash2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [totals, setTotals] = useState({ income: 0, expense: 0, net: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [txRes, reportRes] = await Promise.all([
      fetch(`/api/transactions?month=${month}&limit=8`),
      fetch(`/api/reports?year=${month.split("-")[0]}`),
    ]);
    const txData = await txRes.json();
    const reportData = await reportRes.json();

    setTransactions(txData.transactions || []);
    setChartData(reportData.monthlyData || []);

    // Totals for selected month
    const monthlyRow = (reportData.monthlyData || []).find((m: any) => m.month === month);
    if (monthlyRow) {
      setTotals({ income: monthlyRow.income, expense: monthlyRow.expense, net: monthlyRow.net });
    } else {
      setTotals({ income: 0, expense: 0, net: 0 });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [month]);

  async function deleteTransaction(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    load();
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card p-3 text-xs" style={{ minWidth: 140 }}>
        <p className="font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>{label}</p>
        <p style={{ color: "var(--accent-green)" }}>Income: {formatCurrency(payload[0]?.value || 0)}</p>
        <p style={{ color: "var(--accent-red)" }}>Expense: {formatCurrency(payload[1]?.value || 0)}</p>
      </div>
    );
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {getMonthLabel(month)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ width: "auto", padding: "8px 12px" }}
            />
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--accent-green)", color: "#0a0a0f" }}
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Income"
            value={formatCurrency(totals.income)}
            sub={`${transactions.filter(t => t.type === "income").length} transactions`}
            color="green"
            animClass="animate-fade-up-1"
          />
          <StatCard
            label="Expenses"
            value={formatCurrency(totals.expense)}
            sub={`${transactions.filter(t => t.type === "expense").length} transactions`}
            color="red"
            animClass="animate-fade-up-2"
          />
          <StatCard
            label="Net Balance"
            value={formatCurrency(totals.net)}
            sub={totals.net >= 0 ? "You're in the green 🎉" : "Spending exceeds income"}
            color={totals.net >= 0 ? "blue" : "amber"}
            animClass="animate-fade-up-3"
          />
        </div>

        {/* Chart */}
        <div className="card p-5 mb-8 animate-fade-up-4">
          <p className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
            Income vs Expenses — {month.split("-")[0]}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e676" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5252" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff5252" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="monthName" tick={{ fill: "#8888aa", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8888aa", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#00e676" strokeWidth={2} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#ff5252" strokeWidth={2} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent transactions */}
        <div className="card animate-fade-up">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--bg-border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Transactions</p>
            <a href="/transactions" className="text-xs" style={{ color: "var(--accent-blue)" }}>View all →</a>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No transactions this month. Add your first one!</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--bg-border)" }}>
              {transactions.map((tx) => (
                <div key={tx._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: tx.type === "income" ? "rgba(0,230,118,0.12)" : "rgba(255,82,82,0.12)" }}
                  >
                    {tx.type === "income"
                      ? <ArrowUpRight size={15} color="var(--accent-green)" />
                      : <ArrowDownRight size={15} color="var(--accent-red)" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{tx.description}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{tx.category} · {formatDate(tx.date)}</p>
                  </div>
                  <p className="text-sm font-semibold font-mono" style={{ color: tx.type === "income" ? "var(--accent-green)" : "var(--accent-red)" }}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(tx); setModalOpen(true); }} className="p-1.5 rounded hover:bg-white/10" style={{ color: "var(--text-secondary)" }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deleteTransaction(tx._id)} className="p-1.5 rounded hover:bg-white/10" style={{ color: "var(--accent-red)" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        editing={editing}
      />
    </Shell>
  );
}
