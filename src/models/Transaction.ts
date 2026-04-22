import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes for fast reporting queries
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1, date: -1 });
TransactionSchema.index({ category: 1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
