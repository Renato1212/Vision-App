import { NextResponse } from "next/server";
import { getReport } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const report = getReport(context.params.id);
  if (!report) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    status: report.status,
    error: report.error,
  });
}
