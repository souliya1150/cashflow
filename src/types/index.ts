export type TransactionType = "income" | "expense";

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  type: "income" | "expense" | "both";
  color: string;
  icon: string;
}

export interface MonthlySummary {
  month: string; // "2024-01"
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  color?: string;
}
