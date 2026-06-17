import { getLocalities } from "lib/vadmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provinceId = searchParams.get("province_id");
  const search = searchParams.get("search");
  const id = searchParams.get("id");
  const perPage = searchParams.get("perPage");

  const localities = await getLocalities({
    provinceId: provinceId ? Number(provinceId) : undefined,
    search: search || undefined,
    id: id ? Number(id) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  });

  return NextResponse.json(localities);
}
