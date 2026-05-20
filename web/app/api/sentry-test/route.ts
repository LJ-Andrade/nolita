import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const eventId = Sentry.captureException(
    new Error("Sentry storefront server test error"),
  );

  await Sentry.flush(2000);

  return NextResponse.json({ eventId });
}
