import { cookies } from "next/headers";
import { connection } from "next/server";

export type PriceMode = "retail" | "wholesale";

export function normalizePriceMode(mode?: string | null): PriceMode {
  return mode === "retail" ? "retail" : "wholesale";
}

export async function getServerPriceMode(): Promise<PriceMode> {
  await connection();
  return normalizePriceMode(
    (await cookies()).get("nolita_price_mode_v2")?.value,
  );
}
