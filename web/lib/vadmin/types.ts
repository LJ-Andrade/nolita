export type Maybe<T> = T | null;

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type SEO = {
  title: string;
  description: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
  hexValues?: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  compareAtPrice?: Money | null;
  discount?: number;
  hasDiscount?: boolean;
};

export type Product = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  fabric?: string | null;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  compareAtPriceRange?: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  } | null;
  priceMode?: "retail" | "wholesale";
  salePrice?: string | null;
  wholesalePrice?: string | null;
  hideOnWholesale?: boolean;
  discount?: number;
  retailDiscount?: number;
  wholesaleDiscount?: number;
  hasDiscount?: boolean;
  variants: ProductVariant[];
  featuredImage: Image;
  images: Image[];
  seo: SEO;
  category?: {
    handle: string;
    title: string;
  } | null;
  tags: string[];
  updatedAt: string;
  colorImages?: { color: string; hex?: string; url: string }[];
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
  path: string;
  image?: string;
  listed?: boolean;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
    compareAtTotalAmount?: Money | null;
  };
  discount?: number;
  hasDiscount?: boolean;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: {
      id: string;
      handle: string;
      title: string;
      stock?: number;
      salePrice?: string | null;
      retailPrice?: string | null;
      wholesalePrice?: string | null;
      retailDiscount?: number;
      wholesaleDiscount?: number;
      hideOnWholesale?: boolean;
      featuredImage: Image;
      colorImages?: { color: string; hex?: string; url: string }[];
    };
  };
};

export type Cart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: CartItem[];
  totalQuantity: number;
  priceMode?: "retail" | "wholesale";
};

export type Menu = {
  title: string;
  path: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryMethod = {
  id: string;
  name: string;
  description: string;
  fee: string;
};

export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  fee: string;
};

export type ShopConfiguration = {
  id: number;
  min_quantity: number;
  min_amount: number;
};
