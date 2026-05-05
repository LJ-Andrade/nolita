import { getLocalities } from "lib/vadmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provinceId = searchParams.get("province_id");
  const localities = await getLocalities(provinceId ? Number(provinceId) : undefined);
  return NextResponse.json(localities);
}