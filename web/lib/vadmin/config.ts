const rawVadminApiEndpoint = process.env.NEXT_PUBLIC_VADMIN_API_URL;

if (!rawVadminApiEndpoint) {
  throw new Error("NEXT_PUBLIC_VADMIN_API_URL is required.");
}

export const VADMIN_API_ENDPOINT = rawVadminApiEndpoint.replace(/\/+$/, "");

export function vadminApiUrl(path: string) {
  return `${VADMIN_API_ENDPOINT}/${path.replace(/^\/+/, "")}`;
}
