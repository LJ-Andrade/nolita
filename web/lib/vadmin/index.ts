import { TAGS } from "lib/constants";
import {
  revalidatePath,
  revalidateTag,
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { 
  Cart, 
  Collection, 
  Menu, 
  Page, 
  Product, 
  ShopConfiguration,
} from "./types";

const endpoint = process.env.NEXT_PUBLIC_VADMIN_API_URL || "http://localhost:8000/api";
const storefrontTags = [
  TAGS.products,
  TAGS.collections,
  TAGS.siteContent,
  TAGS.shopConfiguration,
  TAGS.checkoutMethods,
] as const;
const storefrontPaths = ["/", "/catalog", "/search"] as const;

export async function vadminFetch<T>({
  cache,
  headers,
  method = "GET",
  params,
  body,
  path,
  silentStatuses = [],
  tags,
  revalidate,
}: {
  cache?: RequestCache;
  headers?: HeadersInit;
  method?: string;
  params?: Record<string, string | boolean | undefined>;
  body?: any;
  path: string;
  silentStatuses?: number[];
  tags?: string[];
  revalidate?: number;
}): Promise<{ status: number; body: T } | never> {
  try {
    const url = new URL(`${endpoint}/${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }

    const finalHeaders = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...headers,
    };

    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
    const finalCache = cache || (isMutation ? "no-store" : "force-cache");
    const nextOptions =
      finalCache === "no-store" || (!tags?.length && revalidate === undefined)
        ? undefined
        : {
            ...(tags?.length ? { tags } : {}),
            ...(revalidate !== undefined ? { revalidate } : {}),
          };

    const fetchOptions: RequestInit & {
      next?: { tags?: string[]; revalidate?: number };
    } = {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      cache: finalCache,
      ...(nextOptions ? { next: nextOptions } : {}),
    };

    const result = await fetch(url.toString(), fetchOptions);

    const contentType = result.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await result.json();
    } else {
      const text = await result.text();
      throw {
        status: result.status,
        message: `API returned ${contentType || 'no content-type'}. Error: ${text.substring(0, 100)}`,
      };
    }

    if (!result.ok) {
      const error = new Error(data.message || "API Error");
      (error as any).status = result.status;
      throw error;
    }

    return {
      status: result.status,
      body: data,
    };
  } catch (e: any) {
    const isSilent = e.status === 404 || silentStatuses.includes(e.status);
    if (!isSilent) {
      console.error(`[vadminFetch Error] path: ${path}`, {
        message: e.message,
        cause: e.cause,
        status: e.status
      });
    }
    
    // Check for connection errors or server failures (500, 503, Network, DB)
    const isNetworkError = e.message?.includes("fetch failed") || e.cause?.code === "ECONNREFUSED" || e.cause?.code === "ENOTFOUND";
    const isDbError = e.message?.toLowerCase().includes("base de datos") || e.message?.toLowerCase().includes("database connection");
    const isServerError = e.status === 500 || e.status === 503;

    if (isNetworkError || isDbError || isServerError) {
      console.warn(`[vadminFetch] Redirecting to maintenance. Network: ${isNetworkError}, DB: ${isDbError}, Server: ${isServerError}`);
      redirect("/maintenance");
    }

    throw e;
  }
}
export function getVadminImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  // Extract base domain from endpoint (e.g. http://localhost:8000/api -> http://localhost:8000)
  const baseUrl = endpoint.replace("/api", "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}

// CATALOG
export async function getProducts({
  category,
  query,
  reverse,
  sortKey,
}: {
  category?: string;
  query?: string;
  reverse?: boolean;
  sortKey?: string;
} = {}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await vadminFetch<Product[]>({
    path: "catalog/products",
    params: { category, search: query, reverse, sortKey },
    tags: [TAGS.products],
  });

  return res.body;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  try {
    const res = await vadminFetch<Product>({
      path: `catalog/products/${handle}`,
      tags: [TAGS.products],
    });
    return res.body;
  } catch (e) {
    return undefined;
  }
}

export async function getCollections(params?: { listed?: boolean }): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await vadminFetch<any[]>({
    path: "catalog/categories",
    params: params as any,
    tags: [TAGS.collections],
  });

  // Transform VADMIN categories to Storefront Collections
  const collections = res.body.map((cat) => ({
    handle: cat.slug,
    title: cat.name,
    description: cat.description || "",
    seo: {
      title: cat.name,
      description: cat.description || "",
    },
    updatedAt: cat.updated_at,
    path: `/search/${cat.slug}`,
    image: cat.image ? getVadminImageUrl(cat.image) : undefined,
  }));

  if (params?.listed) {
    return collections;
  }

  // Add "All" collection
  return [
    {
      handle: "",
      title: "Todo",
      description: "Todos los productos",
      seo: { title: "Todo", description: "Todos los productos" },
      path: "/search",
      updatedAt: new Date().toISOString(),
    },
    ...collections,
  ];
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const collections = await getCollections();
  return collections.find((c) => c.handle === handle);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  const res = await vadminFetch<Product[]>({
    path: "catalog/products",
    params: { category: collection, reverse, sortKey },
    tags: [TAGS.products, TAGS.collections],
  });

  return res.body;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  // Static menu for now or fetch from categories
  if (handle === 'next-js-commerce-footer-menu') {
    return [
      { title: 'Inicio', path: '/' },
      { title: 'Contacto', path: '/contact' },
    ];
  }
  
  const collections = await getCollections();
  return collections.slice(0, 5).map(c => ({
    title: c.title,
    path: c.path
  }));
}

export async function revalidate(req: NextRequest): Promise<NextResponse> {
  const expectedToken = process.env.NEXTJS_REVALIDATE_TOKEN;

  if (!expectedToken) {
    return NextResponse.json(
      { revalidated: false, message: "Revalidation token is not configured" },
      { status: 500 },
    );
  }

  let payload: {
    token?: string;
    tags?: string[];
    paths?: string[];
  } = {};

  if (req.headers.get("content-type")?.includes("application/json")) {
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }
  }

  const token =
    req.headers.get("x-revalidate-token") ||
    req.nextUrl.searchParams.get("token") ||
    payload.token;

  if (token !== expectedToken) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid revalidation token" },
      { status: 401 },
    );
  }

  const requestedTags = payload.tags?.length ? payload.tags : [...storefrontTags];
  const validTags = requestedTags.filter((tag) =>
    storefrontTags.includes(tag as (typeof storefrontTags)[number]),
  );
  const requestedPaths = payload.paths?.length ? payload.paths : [...storefrontPaths];

  validTags.forEach((tag) => revalidateTag(tag, { expire: 0 }));
  requestedPaths.forEach((path) => {
    if (path.startsWith("/")) {
      revalidatePath(path);
    }
  });

  return NextResponse.json({
    revalidated: true,
    tags: validTags,
    paths: requestedPaths,
  });
}

export async function getPage(handle: string): Promise<Page | undefined> {
  // TODO: Implement VADMIN pages endpoint
  return undefined;
}

export async function getPages(): Promise<Page[]> {
  // TODO: Implement VADMIN pages endpoint
  return [];
}

export async function getSiteContent(section?: string): Promise<Record<string, string>> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  try {
    const res = await vadminFetch<{ data: Record<string, string> }>({
      path: "public/site-content",
      params: { section },
      tags: [TAGS.siteContent],
    });
    return res.body.data;
  } catch (e) {
    console.error("Error fetching site content:", e);
    return {};
  }
}

export async function getShopConfiguration(): Promise<ShopConfiguration> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  try {
    const res = await vadminFetch<{ data: ShopConfiguration }>({
      path: "public/shop-configuration",
      tags: [TAGS.shopConfiguration],
    });
    return res.body.data;
  } catch (e) {
    console.error("Error fetching shop configuration:", e);
    return { id: 0, min_quantity: 0, min_amount: 0 };
  }
}

export type Province = {
  id: number;
  name: string;
  code: string | null;
  cost: number | null;
};

export type Locality = {
  id: number;
  name: string;
  province_id: number;
  cost: number | null;
};

type PaginatedResponse<T> = {
  data: T[];
};

function unwrapCollection<T>(response: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(response) ? response : response.data;
}

export async function getProvinces(): Promise<Province[]> {
  const res = await vadminFetch<Province[] | PaginatedResponse<Province>>({
    path: "provinces",
    params: { perPage: "200" },
  });
  return unwrapCollection(res.body);
}

export async function getLocalities(provinceId?: number): Promise<Locality[]> {
  const res = await vadminFetch<Locality[] | PaginatedResponse<Locality>>({
    path: "localities",
    params: {
      perPage: "1000",
      province_id: provinceId ? String(provinceId) : undefined,
    },
  });
  return unwrapCollection(res.body);
}
