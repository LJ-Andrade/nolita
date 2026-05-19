"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { GridTileImage } from "components/grid/tile";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export function Gallery({
  images,
}: {
  images: { src: string; altText: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageIndex = searchParams.has("image")
    ? parseInt(searchParams.get("image")!)
    : 0;

  const updateImage = (index: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("image", index);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
  const previousImageIndex =
    imageIndex === 0 ? images.length - 1 : imageIndex - 1;

  const buttonClassName =
    "h-full px-6 transition-all ease-in-out hover:scale-110 hover:text-black dark:hover:text-white flex items-center justify-center";

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <ul className="flex flex-row gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-y-auto lg:pb-0 scrollbar-hide">
          {images.map((image, index) => {
            const isActive = index === imageIndex;
            return (
              <li
                key={image.src}
                className="h-20 w-20 shrink-0 lg:h-24 lg:w-24"
              >
                <button
                  onClick={() => updateImage(index.toString())}
                  aria-label="Select product image"
                  className={clsx(
                    "relative h-full w-full overflow-hidden border-2 transition-all duration-200",
                    isActive
                      ? "border-black dark:border-white"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    alt={image?.altText || ""}
                    src={image?.src || ""}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Main Image */}
      <div className="relative isolate aspect-[4/5] w-full flex-1 overflow-hidden border border-neutral-200 bg-neutral-50">
        {images[imageIndex] && (
          <Image
            className="h-full w-full object-cover transition-all duration-500"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt={images[imageIndex]?.altText || ""}
            src={images[imageIndex]?.src || ""}
            priority={true}
          />
        )}
      </div>
    </div>
  );
}
