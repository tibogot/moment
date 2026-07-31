import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-svh w-full">
      <Image
        src="/images/anita-austvika.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex h-full flex-col justify-end px-[18px] pb-16">
        <p className="font-owners-narrow-bold max-w-xl text-4xl leading-tight text-cream md:text-5xl">
          Every moment,
          <br />
          worth savoring.
        </p>
      </div>
    </section>
  );
}
