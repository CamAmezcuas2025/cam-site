import { NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  await sleep(300);
  return NextResponse.json({
    success: true,
    data: {
      activeMembers: 27,
      totalLogs: 164,
      upcomingClasses: 9,
      pendingPayments: 2,
    },
    updatedAt: new Date().toISOString(),
  });
}
