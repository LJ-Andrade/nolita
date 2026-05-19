"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type ProductMediaImage = {
  src: string;
  altText: string;
};

type ProductMediaProps = {
  images: ProductMediaImage[];
  title: string;
};

export function ProductMedia({ images, title }: ProductMediaProps) {
  const media = useMemo(() => images, [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const isModalOpen = modalIndex !== null;
  const modalImage = isModalOpen ? media[modalIndex] : null;

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  const showPrevious = useCallback(() => {
    setModalIndex((index) =>
      index === null ? index : index === 0 ? media.length - 1 : index - 1,
    );
  }, [media.length]);

  const showNext = useCallback(() => {
    setModalIndex((index) =>
      index === null ? index : index + 1 >= media.length ? 0 : index + 1,
    );
  }, [media.length]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, showNext, showPrevious]);

  return (
    <>
      <section aria-label={`${title} imágenes`} className="w-full">
        {!media.length ? (
          <div className="aspect-[5/7] w-full bg-neutral-100" />
        ) : null}

        <div className="hidden grid-cols-2 gap-4 md:grid">
          {media.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => openModal(index)}
              className="group relative aspect-[5/7] w-full overflow-hidden bg-neutral-50 text-left outline-none"
              aria-label={`Ampliar imagen ${index + 1} de ${title}`}
            >
              <Image
                src={image.src}
                alt={image.altText || title}
                fill
                priority={index < 2}
                sizes="(min-width: 1280px) 32vw, (min-width: 768px) 45vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              />
            </button>
          ))}
        </div>

        <div className="md:hidden">
          <div
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
            onScroll={(event) => {
              const target = event.currentTarget;
              const nextIndex = Math.round(
                target.scrollLeft / target.clientWidth,
              );
              setActiveIndex(
                Math.min(Math.max(nextIndex, 0), media.length - 1),
              );
            }}
          >
            {media.map((image, index) => (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={() => openModal(index)}
                className="relative aspect-[5/7] w-full shrink-0 snap-center overflow-hidden bg-neutral-50"
                aria-label={`Ampliar imagen ${index + 1} de ${title}`}
              >
                <Image
                  src={image.src}
                  alt={image.altText || title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {media.length > 1 && (
            <div className="mt-3 flex justify-center gap-2">
              {media.map((image, index) => (
                <span
                  key={`${image.src}-dot-${index}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex === index ? "w-6 bg-black" : "w-1.5 bg-black/20"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {isModalOpen && modalImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} imagen ampliada`}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 p-4"
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center text-white transition-opacity hover:opacity-70"
            aria-label="Cerrar imagen ampliada"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white transition-opacity hover:opacity-70"
                aria-label="Imagen anterior"
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white transition-opacity hover:opacity-70"
                aria-label="Imagen siguiente"
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="relative h-[86vh] w-full max-w-5xl">
            <Image
              src={modalImage.src}
              alt={modalImage.altText || title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
