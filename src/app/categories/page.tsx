"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { Category } from "@/types";
import { Plus, Tag, X } from "lucide-react";

const COLORS = ["#00e676","#ff5252","#448aff","#e040fb","#ffab40","#00bcd4","#ff7043","#66bb6a","#ec407a","#ab47bc","#26c6da","#8888aa"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "expense" as "income"|"expense"|"both", color: "#448aff" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ name: "", type: "expense", color: "#448aff" });
      setShowForm(false);
      setError("");
      load();
    } else {
      const d = await res.json();
      setError(d.error || "Failed to create");
    }
  }

  const income = categories.filter(c => c.type === "income" || c.type === "both");
  const expense = categories.filter(c => c.type === "expense" || c.type === "both");

  return (
    <Shell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Categories</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{categories.length} categories total</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "var(--accent-blue)", color: "#fff" }}
          >
            <Plus size={16} /> New Category
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="card p-5 mb-6 animate-fade-up" style={{ borderColor: "var(--accent-blue)44" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>New Category</p>
              <button onClick={() => { setShowForm(false); setError(""); }} style={{ color: "var(--text-secondary)" }}><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Groceries" />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Color</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                      style={{ background: c, outline: form.color === c ? `2px solid white` : "none", outlineOffset: 2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {error && <p className="text-xs mb-3" style={{ color: "var(--accent-red)" }}>{error}</p>}
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: "var(--accent-blue)", color: "#fff" }}
            >
              {saving ? "Saving..." : "Create Category"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Income */}
          <div className="animate-fade-up-1">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-green)" }}>Income</p>
            <div className="flex flex-col gap-2">
              {income.map(cat => (
                <div key={cat._id} className="card-elevated flex items-center gap-3 px-4 py-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <p className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>{cat.name}</p>
                  {cat.type === "both" && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-border)", color: "var(--text-muted)" }}>both</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Expense */}
          <div className="animate-fade-up-2">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-red)" }}>Expense</p>
            <div className="flex flex-col gap-2">
              {expense.map(cat => (
                <div key={cat._id} className="card-elevated flex items-center gap-3 px-4 py-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <p className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>{cat.name}</p>
                  {cat.type === "both" && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-border)", color: "var(--text-muted)" }}>both</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
