import { getProvinces } from "lib/vadmin";
import { NextResponse } from "next/server";

export async function GET() {
  const provinces = await getProvinces();
  return NextResponse.json(provinces);
}