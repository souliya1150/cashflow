import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "income", color: "#00e676", icon: "briefcase" },
  { name: "Freelance", type: "income", color: "#00bcd4", icon: "laptop" },
  { name: "Investment", type: "income", color: "#e040fb", icon: "trending-up" },
  { name: "Other Income", type: "income", color: "#ffab40", icon: "plus-circle" },
  { name: "Food & Dining", type: "expense", color: "#ff5252", icon: "utensils" },
  { name: "Transport", type: "expense", color: "#448aff", icon: "car" },
  { name: "Housing", type: "expense", color: "#ff7043", icon: "home" },
  { name: "Entertainment", type: "expense", color: "#ab47bc", icon: "film" },
  { name: "Healthcare", type: "expense", color: "#26c6da", icon: "heart" },
  { name: "Shopping", type: "expense", color: "#ec407a", icon: "shopping-bag" },
  { name: "Education", type: "expense", color: "#66bb6a", icon: "book" },
  { name: "Other Expense", type: "expense", color: "#8888aa", icon: "tag" },
];

export async function GET() {
  try {
    await connectDB();

    // Seed defaults if empty
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
    }

    const categories = await Category.find().sort({ type: 1, name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const category = await Category.create(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
