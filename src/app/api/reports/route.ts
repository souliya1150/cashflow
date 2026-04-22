import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Monthly income vs expense
    const monthly = await Transaction.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Build 12-month grid
    const monthlyMap: Record<number, { income: number; expense: number }> = {};
    for (let i = 1; i <= 12; i++) {
      monthlyMap[i] = { income: 0, expense: 0 };
    }
    monthly.forEach((row) => {
      const m = row._id.month;
      monthlyMap[m][row._id.type as "income" | "expense"] = row.total;
    });

    const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({
      month: `${year}-${String(month).padStart(2, "0")}`,
      monthName: new Date(year, Number(month) - 1, 1).toLocaleString("default", { month: "short" }),
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }));

    // Category breakdown for the year
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Totals
    const totals = monthlyData.reduce(
      (acc, m) => ({
        income: acc.income + m.income,
        expense: acc.expense + m.expense,
        net: acc.net + m.net,
      }),
      { income: 0, expense: 0, net: 0 }
    );

    return NextResponse.json({ monthlyData, categoryBreakdown, totals, year });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
