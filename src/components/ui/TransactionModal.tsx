"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Transaction, Category } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Transaction | null;
}

const EMPTY = {
  type: "expense" as "income" | "expense",
  amount: "",
  description: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function TransactionModal({ open, onClose, onSaved, editing }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        type: editing.type,
        amount: String(editing.amount),
        description: editing.description,
        category: editing.category,
        date: editing.date.slice(0, 10),
        notes: editing.notes || "",
      });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [editing, open]);

  if (!open) return null;

  const filtered = categories.filter(
    (c) => c.type === form.type || c.type === "both"
  );

  async function handleSubmit() {
    if (!form.amount || !form.description || !form.category) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/transactions/${editing._id}` : "/api/transactions";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    setLoading(false);
    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const d = await res.json();
      setError(d.error || "Something went wrong");
    }
  }

  const isIncome = form.type === "income";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="card w-full max-w-md animate-fade-up" style={{ borderColor: "var(--bg-border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--bg-border)" }}>
          <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
            {editing ? "Edit Transaction" : "New Transaction"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "var(--text-secondary)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--bg-border)" }}>
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t, category: "" }))}
                className="flex-1 py-2 text-sm font-medium capitalize transition-all"
                style={{
                  background: form.type === t
                    ? t === "income" ? "var(--accent-green)" : "var(--accent-red)"
                    : "var(--bg-elevated)",
                  color: form.type === t ? "#0a0a0f" : "var(--text-secondary)",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Amount *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              style={{ borderColor: isIncome ? "var(--accent-green)" : "var(--accent-red)", fontFamily: "DM Mono, monospace" }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Description *</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Category *</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="">Select a category</option>
              {filtered.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Notes (optional)</label>
            <textarea
              rows={2}
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              style={{ resize: "none" }}
            />
          </div>

          {error && <p className="text-xs" style={{ color: "var(--accent-red)" }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{
              background: isIncome ? "var(--accent-green)" : "var(--accent-red)",
              color: "#0a0a0f",
            }}
          >
            {loading ? "Saving..." : editing ? "Update Transaction" : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}
