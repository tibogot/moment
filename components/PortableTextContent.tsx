import { PortableText, type PortableTextComponents } from "next-sanity";
import { SanityImage } from "@/components/SanityImage";
import type {
  NewsArticle,
  SanityImage as SanityImageType,
} from "@/lib/sanity/types";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-owners-narrow-bold mt-10 text-[8vw] leading-[0.95] tracking-[-0.005em] uppercase md:mt-12 md:text-[min(4vw,6svh)]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-owners-medium mt-8 text-[12px] uppercase tracking-wide md:mt-10">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      // Flat 18px: this is the article's reading text, and the vw clamp it
      // carried resolved to 15px on a phone — too small for a long read.
      <p className="font-archivo-light mt-4 text-[18px] leading-normal text-black/80">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="font-archivo-light mt-6 border-l border-sky pl-4 text-[18px] leading-normal text-black/70 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const isExternal = href.startsWith("http");

      return (
        <a
          href={href}
          className="underline underline-offset-4 transition-opacity hover:opacity-60"
          {...(isExternal
            ? { rel: "noreferrer noopener", target: "_blank" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="font-archivo-light mt-4 list-disc space-y-2 pl-5 text-[18px] leading-normal text-black/80">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="font-archivo-light mt-4 list-decimal space-y-2 pl-5 text-[18px] leading-normal text-black/80">
        {children}
      </ol>
    ),
  },
  types: {
    image: ({ value }) => {
      const image = value as SanityImageType & { caption?: string };
      if (!image?.asset) return null;

      return (
        <figure className="mt-8">
          <div className="relative aspect-4/3 w-full overflow-hidden bg-sky/20">
            <SanityImage
              image={image}
              alt={image.alt ?? ""}
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
          {image.caption ? (
            <figcaption className="font-archivo-light mt-3 text-[15px] text-black/60">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

type PortableTextContentProps = {
  value: NewsArticle["body"];
};

export function PortableTextContent({ value }: PortableTextContentProps) {
  return <PortableText value={value} components={components} />;
}
