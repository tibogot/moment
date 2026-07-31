import TextReveal from "@/components/TextReveal";
import Image from "next/image";

export default function TestTextRevealPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto max-w-6xl">
        <section className="flex h-screen items-center justify-center px-4 sm:px-8">
          <div className="w-full max-w-full text-center">
            <TextReveal animateOnScroll={false} blockColor="#000" delay={0.3}>
              <h1 className="font-owners-medium text-4xl leading-tight font-black break-words text-gray-900 sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl">
                Beautiful Text
                <br />
                Reveal Animation
              </h1>
            </TextReveal>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-24 sm:px-8">
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden">
            <Image
              src="https://picsum.photos/1200/675?random=1"
              alt="Beautiful Landscape"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-32 sm:px-8">
          <div className="mx-auto w-full max-w-5xl text-center">
            <TextReveal blockColor="#3b82f6" stagger={0.2} duration={0.8}>
              <div className="mx-auto space-y-6 text-center">
                <h2 className="text-center text-3xl font-bold break-words text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                  Smooth & Elegant
                </h2>
                <p className="font-archivo-light text-center text-lg break-words text-gray-700 sm:text-xl md:text-2xl lg:text-3xl">
                  Experience the power of GSAP animations
                </p>
                <p className="font-archivo-light text-center text-base break-words text-gray-600 sm:text-lg md:text-xl lg:text-2xl">
                  With customizable reveal effects
                </p>
              </div>
            </TextReveal>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-24 sm:px-8">
          <div className="relative aspect-square w-full max-w-3xl overflow-hidden">
            <Image
              src="https://picsum.photos/800/800?random=2"
              alt="Portrait Photo"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 768px"
              className="object-cover"
            />
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-32 sm:px-8">
          <div className="mx-auto w-full max-w-5xl text-center">
            <TextReveal animateOnScroll={true} blockColor="#10b981" delay={0.2}>
              <div className="mx-auto text-center">
                <h2 className="font-owners-medium mb-8 text-center text-3xl font-semibold break-words text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                  Scroll Down to See Magic
                </h2>
                <p className="font-archivo-light text-center text-lg break-words text-gray-600 sm:text-xl md:text-2xl">
                  Each section reveals as you scroll
                </p>
              </div>
            </TextReveal>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-8">
          <div className="relative h-[60vh] w-full overflow-hidden">
            <Image
              src="https://picsum.photos/1600/900?random=3"
              alt="Wide Landscape"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-32 sm:px-8">
          <div className="mx-auto w-full max-w-5xl text-center">
            <TextReveal
              blockColor="#8b5cf6"
              stagger={0.1}
              animateOnScroll={true}
            >
              <div className="mx-auto space-y-8 text-center">
                <h3 className="font-owners-medium text-center text-2xl font-bold break-words text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                  Multiple Elements
                </h3>
                <p className="font-archivo-light text-center text-lg break-words text-gray-700 sm:text-xl md:text-2xl lg:text-3xl">
                  Use data-copy-wrapper attribute
                </p>
                <p className="font-archivo-light text-center text-base break-words text-gray-600 sm:text-lg md:text-xl lg:text-2xl">
                  To animate all children separately
                </p>
              </div>
            </TextReveal>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-24 sm:px-8">
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden">
            <Image
              src="https://picsum.photos/1200/675?random=4"
              alt="Nature Scene"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 896px"
              className="object-cover"
            />
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-32 sm:px-8">
          <div className="mx-auto w-full max-w-5xl text-center">
            <TextReveal
              animateOnScroll={false}
              blockColor="#ef4444"
              delay={0.5}
            >
              <div className="mx-auto text-center">
                <p className="font-archivo-light text-center text-2xl break-words text-gray-800 sm:text-3xl md:text-4xl lg:text-5xl">
                  This reveals immediately on page load
                </p>
              </div>
            </TextReveal>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-32 sm:px-8">
          <div className="mx-auto w-full max-w-4xl text-left">
            <TextReveal
              animateOnScroll={true}
              blockColor="#ec4899"
              stagger={0.15}
              duration={0.8}
            >
              <h2 className="font-owners-medium mb-8 text-2xl font-bold break-words text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                Long Paragraph Example
              </h2>
            </TextReveal>
            <TextReveal
              animateOnScroll={true}
              blockColor="#ec4899"
              stagger={0.15}
              duration={0.8}
            >
              <p className="font-archivo-light text-base leading-relaxed break-words text-gray-700 sm:text-lg md:text-xl">
                This is a longer paragraph that will definitely wrap to multiple
                lines when displayed on the screen. The TextReveal component
                will automatically detect each line break and create a separate
                block revealer for each line of text. As you can see, this
                paragraph contains enough text to span across several lines,
                allowing you to observe how the animation creates individual
                blocks for each line. The stagger effect will make each line
                reveal sequentially, creating a beautiful cascading animation
                effect that draws attention to the content as it appears on
                screen. This demonstrates the power of GSAPs SplitText plugin
                combined with custom reveal animations to create engaging and
                professional text animations.
              </p>
            </TextReveal>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-24 sm:px-8">
          <div className="relative aspect-square w-full max-w-3xl overflow-hidden">
            <Image
              src="https://picsum.photos/800/800?random=5"
              alt="Artistic Photo"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 768px"
              className="object-cover"
            />
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-32 sm:px-8">
          <div className="mx-auto w-full max-w-5xl text-center">
            <TextReveal blockColor="#f59e0b" duration={1} stagger={0.15}>
              <div className="mx-auto rounded-3xl bg-gray-900 p-6 text-center sm:p-8 md:p-12 lg:p-16">
                <h2 className="font-owners-medium text-center text-3xl font-black break-words text-white sm:text-4xl md:text-5xl lg:text-6xl">
                  Works With Any Styling
                </h2>
                <p className="font-archivo-light mt-6 text-center text-lg break-words text-gray-300 sm:text-xl md:text-2xl lg:text-3xl">
                  Dark backgrounds, light backgrounds, gradients
                </p>
              </div>
            </TextReveal>
          </div>
        </section>

        <section className="relative h-screen w-full overflow-hidden">
          <Image
            src="https://picsum.photos/1920/1080?random=6"
            alt="Full Width Background"
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mx-auto w-full max-w-6xl px-4 text-center sm:px-8">
              <TextReveal blockColor="#ffffff" duration={0.9} stagger={0.2}>
                <div className="mx-auto text-center">
                  <h2 className="font-owners-medium text-center text-3xl font-black break-words text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl">
                    Text Over Image
                  </h2>
                  <p className="font-archivo-light mt-6 text-center text-lg break-words text-white/90 sm:text-xl md:text-2xl lg:text-3xl">
                    Beautiful reveal on any background
                  </p>
                </div>
              </TextReveal>
            </div>
          </div>
        </section>

        <div className="h-32" />
      </div>
    </div>
  );
}
