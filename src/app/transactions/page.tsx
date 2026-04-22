"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import TransactionModal from "@/components/ui/TransactionModal";
import { formatCurrency, formatDate, getCurrentMonth } from "@/lib/utils";
import { Transaction, Category } from "@/types";
import { Plus, ArrowUpRight, ArrowDownRight, Pencil, Trash2, Search } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [month, setMonth] = useState(getCurrentMonth());
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const LIMIT = 20;

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ month, limit: String(LIMIT), page: String(page) });
    if (typeFilter) params.set("type", typeFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    const res = await fetch(`/api/transactions?${params}`);
    const data = await res.json();
    setTransactions(data.transactions || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => { setPage(1); }, [month, typeFilter, categoryFilter]);
  useEffect(() => { load(); }, [month, typeFilter, categoryFilter, page]);

  async function deleteTransaction(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = transactions.filter(tx =>
    !search || tx.description.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Shell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Transactions</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{total} records found</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "var(--accent-green)", color: "#0a0a0f" }}
          >
            <Plus size={16} /> Add Transaction
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-5 flex flex-wrap gap-3 animate-fade-up-1">
          <div className="flex items-center gap-2 flex-1 min-w-40">
            <Search size={15} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "6px 0", border: "none", background: "transparent", flex: 1 }}
            />
          </div>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: "auto", padding: "6px 10px", fontSize: 13 }} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: "auto", padding: "6px 10px", fontSize: 13 }}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: "auto", padding: "6px 10px", fontSize: 13 }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card animate-fade-up-2">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                {["Date", "Description", "Category", "Type", "Amount", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>No transactions found.</td></tr>
              ) : filtered.map((tx) => (
                <tr key={tx._id} className="border-b group hover:bg-white/[0.02] transition-colors" style={{ borderColor: "var(--bg-border)" }}>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>{formatDate(tx.date)}</td>
                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{tx.description}</p>
                    {tx.notes && <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{tx.notes}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>{tx.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: tx.type === "income" ? "var(--accent-green)" : "var(--accent-red)" }}>
                      {tx.type === "income" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold font-mono" style={{ color: tx.type === "income" ? "var(--accent-green)" : "var(--accent-red)" }}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(tx); setModalOpen(true); }} className="p-1.5 rounded hover:bg-white/10" style={{ color: "var(--text-secondary)" }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteTransaction(tx._id)} className="p-1.5 rounded hover:bg-white/10" style={{ color: "var(--accent-red)" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t text-xs" style={{ borderColor: "var(--bg-border)", color: "var(--text-secondary)" }}>
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded hover:bg-white/10 disabled:opacity-40">← Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded hover:bg-white/10 disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} editing={editing} />
    </Shell>
  );
}
