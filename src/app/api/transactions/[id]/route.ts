import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const transaction = await Transaction.findById(params.id).lean();
    if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ transaction });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const transaction = await Transaction.findByIdAndUpdate(
      params.id,
      { ...body, date: body.date ? new Date(body.date) : undefined },
      { new: true, runValidators: true }
    ).lean();
    if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ transaction });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const transaction = await Transaction.findByIdAndDelete(params.id);
    if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
