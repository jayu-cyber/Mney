import { NextResponse } from "next/server";
import { sendEmail } from "@/actions/send-email";
import Email from "@/emails/template";

export async function GET(req) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  if (!to) return NextResponse.json({ error: "missing ?to=" }, { status: 400 });

  try {
    const react = Email({ userName: "Test User", type: "budget-alert", data: { percentageUsed: 82.3, budgetAmount: 100, totalExpenses: 82.3 } });
    const res = await sendEmail({ to, subject: "[TEST] Budget Alert", react });
    return NextResponse.json({ ok: true, result: res });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
