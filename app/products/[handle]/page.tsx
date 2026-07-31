import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { getProductByHandle, getProducts } from "@/lib/shopify/products";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(({ handle }) => ({ handle }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) return { title: "Not found — Moment" };

  return {
    title: `${product.title} — Moment`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  return (
    <>
      <GridSection className="pt-[22svh] pb-[12svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-sky/20">
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
        </div>

        <div className="col-start-2 col-end-5 mt-[5svh] px-(--grid-gutter) md:col-start-6 md:col-end-9 md:mt-0">
          <h1 className="font-owners-narrow-bold text-[10vw] leading-[0.95] wrap-break-word uppercase md:text-[min(4vw,6svh)]">
            {product.title}
          </h1>

          <p className="font-archivo-light mt-4 text-[16px]">{product.price}</p>

          {product.description && (
            <p className="font-archivo-light mt-6 text-[15px] leading-[1.6] whitespace-pre-line">
              {product.description}
            </p>
          )}

          {!product.availableForSale && (
            <p className="font-owners-medium mt-6 text-[12px] uppercase tracking-wide">
              Sold out
            </p>
          )}
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
