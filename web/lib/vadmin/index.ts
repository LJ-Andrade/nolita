import { TAGS } from "lib/constants";
import { cacheLife, cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { VADMIN_API_ENDPOINT } from "./config";
import {
  Cart,
  Collection,
  Menu,
  Page,
  Product,
  ShopConfiguration,
} from "./types";

const storefrontTags = [
  TAGS.products,
  TAGS.collections,
  TAGS.siteContent,
  TAGS.shopConfiguration,
  TAGS.checkoutMethods,
] as const;
const storefrontPaths = [
  "/",
  "/catalogo",
  "/catalog",
  "/buscar",
  "/search",
] as const;

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
  redirectOnServerError = true,
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
  redirectOnServerError?: boolean;
}): Promise<{ status: number; body: T } | never> {
  try {
    const url = new URL(`${VADMIN_API_ENDPOINT}/${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }

    const finalHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    };

    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(
      method.toUpperCase(),
    );
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
        message: `API returned ${contentType || "no content-type"}. Error: ${text.substring(0, 100)}`,
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
    const isAbortError =
      e.name === "AbortError" ||
      e.code === "ABORT_ERR" ||
      e.message === "This operation was aborted";
    const isSilent =
      isAbortError || e.status === 404 || silentStatuses.includes(e.status);
    if (!isSilent) {
      console.error(`[vadminFetch Error] path: ${path}`, {
        message: e.message,
        cause: e.cause,
        status: e.status,
      });
    }

    // Check for connection errors or server failures (500, 503, Network, DB)
    const isNetworkError =
      !isAbortError &&
      (e.message?.includes("fetch failed") ||
        e.cause?.code === "ECONNREFUSED" ||
        e.cause?.code === "ENOTFOUND");
    const isDbError =
      e.message?.toLowerCase().includes("base de datos") ||
      e.message?.toLowerCase().includes("database connection");
    const isServerError = e.status === 500 || e.status === 503;

    if (
      redirectOnServerError &&
      (isNetworkError || isDbError || isServerError)
    ) {
      console.warn(
        `[vadminFetch] Redirecting to maintenance. Network: ${isNetworkError}, DB: ${isDbError}, Server: ${isServerError}`,
      );
      redirect("/maintenance");
    }

    throw e;
  }
}
export function getVadminImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  const parsedPath = path.startsWith("http") ? new URL(path) : null;
  const rawPath = parsedPath
    ? `${parsedPath.pathname}${parsedPath.search}`
    : path;
  const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  if (cleanPath.startsWith("/storage/")) {
    return `/vadmin-storage/${cleanPath.replace("/storage/", "")}`;
  }

  return cleanPath;
}

function normalizeProductImageUrls(product: Product): Product {
  const images =
    product.images?.map((image) => ({
      ...image,
      url: getVadminImageUrl(image.url),
    })) ?? [];
  const legacyFeaturedImage = product.featuredImage
    ? {
        ...product.featuredImage,
        url: getVadminImageUrl(product.featuredImage.url),
      }
    : product.featuredImage;

  return {
    ...product,
    featuredImage: images[0] ?? legacyFeaturedImage,
    images,
    colorImages: product.colorImages?.map((image) => ({
      ...image,
      url: getVadminImageUrl(image.url),
    })),
  };
}

// CATALOG
export async function getProducts({
  category,
  mode,
  query,
  reverse,
  sortKey,
}: {
  category?: string;
  mode?: "retail" | "wholesale";
  query?: string;
  reverse?: boolean;
  sortKey?: string;
} = {}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await vadminFetch<Product[]>({
    path: "catalog/products",
    params: { category, mode, search: query, reverse, sortKey },
    tags: [TAGS.products],
  });

  return res.body.map(normalizeProductImageUrls);
}

export async function getProduct(
  handle: string,
  mode?: "retail" | "wholesale",
): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  try {
    const res = await vadminFetch<Product>({
      path: `catalog/products/${handle}`,
      params: { mode },
      tags: [TAGS.products],
    });
    return normalizeProductImageUrls(res.body);
  } catch (e) {
    return undefined;
  }
}

export async function getCollections(params?: {
  listed?: boolean;
}): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await vadminFetch<any[] | { data: any[] }>({
    path: "catalog/categories",
    params: params as any,
    tags: [TAGS.collections],
  });

  // Support both plain array (legacy) and { data: [...] } (resource wrapper)
  const raw = Array.isArray(res.body) ? res.body : res.body.data;

  // Transform VADMIN categories to Storefront Collections
  const collections = raw.map((cat) => ({
    handle: cat.slug,
    title: cat.name,
    description: cat.description || "",
    seo: {
      title: cat.name,
      description: cat.description || "",
    },
    updatedAt: cat.updated_at,
    path: `/catalogo?categoria=${cat.slug}`,
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
      path: "/catalogo",
      updatedAt: new Date().toISOString(),
    },
    ...collections,
  ];
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  const collections = await getCollections();
  return collections.find((c) => c.handle === handle);
}

export async function getCollectionProducts({
  collection,
  mode,
  reverse,
  sortKey,
}: {
  collection: string;
  mode?: "retail" | "wholesale";
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  const res = await vadminFetch<Product[]>({
    path: "catalog/products",
    params: { category: collection, mode, reverse, sortKey },
    tags: [TAGS.products, TAGS.collections],
  });

  return res.body.map(normalizeProductImageUrls);
}

export async function getMenu(handle: string): Promise<Menu[]> {
  // Static menu for now or fetch from categories
  if (handle === "next-js-commerce-footer-menu") {
    return [
      { title: "Inicio", path: "/" },
      { title: "Contacto", path: "/contact" },
    ];
  }

  const collections = await getCollections();
  return collections.slice(0, 5).map((c) => ({
    title: c.title,
    path: c.path,
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

  const requestedTags = payload.tags?.length
    ? payload.tags
    : [...storefrontTags];
  const validTags = requestedTags.filter((tag) =>
    storefrontTags.includes(tag as (typeof storefrontTags)[number]),
  );
  const requestedPaths = payload.paths?.length
    ? payload.paths
    : [...storefrontPaths];

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

export async function getSiteContent(
  section?: string,
): Promise<Record<string, string>> {
  "use cache";
  cacheTag(TAGS.siteContent);
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
  cacheTag(TAGS.shopConfiguration);
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

export async function getLocalities(options?: {
  provinceId?: number;
  search?: string;
  id?: number;
  perPage?: number;
}): Promise<Locality[]> {
  const res = await vadminFetch<Locality[] | PaginatedResponse<Locality>>({
    path: "localities",
    params: {
      perPage: String(options?.perPage ?? 50),
      province_id: options?.provinceId ? String(options.provinceId) : undefined,
      search: options?.search || undefined,
      id: options?.id ? String(options.id) : undefined,
    },
  });
  return unwrapCollection(res.body);
}
