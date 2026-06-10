import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Edit,
  Package,
  Image as ImageIcon,
  Palette,
  Layers,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ImageLightbox,
  useImageLightbox,
} from "@/components/ui/image-lightbox";
import { PageHeader } from "@/components/page-header";
import { getMediaUrl } from "@/lib/media-url";

const PRODUCT_LIST_RETURN_URL_KEY = "admin.products.lastListUrl";

function getProductsListReturnUrl() {
  if (typeof window === "undefined") return "/productos";
  try {
    return (
      window.sessionStorage.getItem(PRODUCT_LIST_RETURN_URL_KEY) || "/productos"
    );
  } catch {
    return "/productos";
  }
}

export default function ProductsShow() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    lightboxOpen,
    lightboxImages,
    lightboxIndex,
    openLightbox,
    closeLightbox,
    goToPrev,
    goToNext,
  } = useImageLightbox();

  useEffect(() => {
    axiosClient
      .get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Ocurrió un error");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-8 text-center">{"No encontrado"}</div>;
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return "-";
    return `$ ${new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)}`;
  };

  const getColorHex = (colorName) => {
    const colorMap = {
      Negro: "#000000",
      Blanco: "#FFFFFF",
      Rojo: "#FF0000",
      Azul: "#0000FF",
      Verde: "#00FF00",
      Gris: "#808080",
      Beige: "#F5F5DC",
      Amarillo: "#FFFF00",
      Naranja: "#FFA500",
      Morado: "#800080",
      Rosa: "#FFC0CB",
      Marron: "#8B4513",
    };
    return colorMap[colorName] || "#808080";
  };

  const galleryImages =
    product.gallery?.map((img) => getMediaUrl(img.url)) || [];
  const allGalleryImages =
    galleryImages.length > 0
      ? galleryImages
      : product.cover_url
        ? [getMediaUrl(product.cover_url)]
        : [];
  const mainImage = allGalleryImages[0] || "";
  const hasVariants = (product.variants?.length || 0) > 0;

  return (
    <div className="space-y-6">
      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}

      <PageHeader
        breadcrumbs={[
          { label: "Productos", href: getProductsListReturnUrl() },
          { label: product.name },
        ]}
        actions={
          <>
            <Button asChild>
              <Link to={`/productos/editar/${product.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                {"Editar"}
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-semibold">#{product.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-mono font-semibold">
                    {product.code || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Slug</p>
                  <p className="font-mono text-sm break-all">
                    {product.slug || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    variant={
                      product.status === "published" ? "default" : "secondary"
                    }
                    className="mt-1 text-sm"
                  >
                    {product.status === "published" ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Precio de Costo
                  </p>
                  <p className="font-semibold text-lg">
                    {formatPrice(product.cost_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Precio Minorista
                  </p>
                  <p className="font-semibold text-lg text-primary">
                    {formatPrice(product.sale_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Precio Mayorista
                  </p>
                  <p className="font-semibold text-lg text-primary">
                    {formatPrice(product.wholesale_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Descuento Minorista
                  </p>
                  <p className="font-semibold">
                    {product.discount > 0 ? `${product.discount}%` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Descuento Mayorista
                  </p>
                  <p className="font-semibold">
                    {product.wholesale_discount > 0
                      ? `${product.wholesale_discount}%`
                      : "-"}
                  </p>
                </div>
              </div>

              <Separator />

              <div
                className={`grid grid-cols-2 gap-4 ${hasVariants ? "md:grid-cols-2" : "md:grid-cols-4"}`}
              >
                {!hasVariants && (
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="font-semibold text-lg">
                      {product.stock ?? 0}
                    </p>
                  </div>
                )}
                {!hasVariants && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Stock Mínimo
                    </p>
                    <p className="font-semibold">{product.min_stock ?? 0}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-semibold">
                    {product.category?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tela/Fabric</p>
                  <p className="font-semibold">{product.fabric || "-"}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Talles</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes && product.sizes.length > 0 ? (
                    product.sizes.map((size) => (
                      <Badge
                        key={size.id}
                        variant="outline"
                        className="px-3 py-1"
                      >
                        {size.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sin talles
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Colores</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors && product.colors.length > 0 ? (
                    product.colors.map((color) => (
                      <div key={color.id} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-border"
                          style={{
                            backgroundColor:
                              color.hex_color || getColorHex(color.name),
                          }}
                          title={color.name}
                        />
                        <span className="text-sm">{color.name}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sin colores
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {product.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </CardContent>
            </Card>
          )}

          {product.meta_title || product.meta_description ? (
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.meta_title && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Meta Título
                    </p>
                    <p className="font-medium">{product.meta_title}</p>
                  </div>
                )}
                {product.meta_description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Meta Descripción
                    </p>
                    <p className="text-sm">{product.meta_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {product.variants && product.variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variantes ({product.variants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Color</TableHead>
                      <TableHead>Talle</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                      <TableHead className="text-center">Activo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-full border border-border"
                              style={{
                                backgroundColor:
                                  variant.color?.hex_color ||
                                  getColorHex(variant.color?.name),
                              }}
                            />
                            <span className="text-sm">
                              {variant.color?.name || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="px-2 py-0.5">
                            {variant.size?.name || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {variant.sku || "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {variant.stock ?? 0}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {variant.min_stock ?? 0}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={variant.active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {variant.active ? "Sí" : "No"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Galería
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mainImage ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {"Portada (primera imagen de galería)"}
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                      Portada
                    </span>
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-64 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openLightbox(allGalleryImages, 0)}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-muted rounded-lg border flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {product.gallery && product.gallery.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Galería ({product.gallery.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {product.gallery.map((img, index) => (
                      <div key={img.id} className="relative">
                        {index === 0 && (
                          <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                            Portada
                          </span>
                        )}
                        <img
                          src={getMediaUrl(img.url)}
                          alt=""
                          className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openLightbox(allGalleryImages, index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                {product.author && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Autor</span>
                    <span className="font-medium">{product.author.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado</span>
                  <span>
                    {new Date(product.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actualizado</span>
                  <span>
                    {new Date(product.updated_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
