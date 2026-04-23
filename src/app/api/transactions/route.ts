import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const month = searchParams.get("month"); // "2024-07"
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, any> = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (month) {
      const [year, m] = month.split("-");
      const start = new Date(Number(year), Number(m) - 1, 1);
      const end = new Date(Number(year), Number(m), 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ transactions, total, page, limit });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { type, amount, description, category, date, notes } = body;

    if (!type || !amount || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transaction = await Transaction.create({
      type,
      amount: Number(amount),
      description,
      category,
      date: date ? new Date(date) : new Date(),
      notes,
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
