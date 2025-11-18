import { Button } from "@/components/ui/button";
import biologyPatternBg from "@/public/pattern-1.png";
import teacherAkram from "@/public/akram-1.jpeg";
import helloSkeletonImg from "@/public/hello-skel.png";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      dir="ltr"
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            clipPath: "polygon(0 0, 60% 0, 45% 100%, 0 100%)",
            backgroundImage: `url(${biologyPatternBg})`,
            backgroundSize: "200px 200px",
            backgroundRepeat: "repeat",
          }}
        />

        <div
          className="absolute inset-0 opacity-10"
          style={{
            clipPath: "polygon(0 0, 60% 0, 45% 100%, 0 100%)",
          }}
        >
          <Image
            src={biologyPatternBg}
            alt="Pattern overlay"
            className="opacity-50"
            width={1000}
            height={1000}
            quality={100}
            placeholder="blur"
          />
        </div>

        <div
          className="absolute inset-0 bg-white dark:bg-slate-900"
          style={{
            clipPath: "polygon(60% 0, 100% 0, 100% 100%, 45% 100%)",
          }}
        />
      </div>

      {/* Hello Skeleton Image - Top Center/Right */}
      <div className="absolute top-50 left-0 z-5 hidden lg:block">
        <div className="relative">
          <Image
            src={helloSkeletonImg}
            alt="Skeleton greeting - biology education mascot"
            width={300}
            height={400}
            quality={100}
            placeholder="blur"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 text-center lg:text-right rtl">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-8 mt-24 md:mt-0">
              <div className="space-y-4">
                <span className="block text-[#295638] relative">
                  العلوم
                  <div className="absolute -bottom-2 right-0 w-20 md:w-32 h-1 bg-[#295638]/20 rounded-full" />
                </span>
                <span className="block text-[#295638] relative mr-8">
                  العلوم المتكامله
                  <div className="absolute -bottom-2 right-8 w-32 h-1 bg-[#295638]/20 rounded-full" />
                </span>
                <span className="block text-[#295638] relative mr-16">
                  الاحياء
                  <div className="absolute -bottom-2 right-0 w-32 h-1 bg-[#295638]/20 rounded-full" />
                </span>
              </div>
            </h1>

            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-2xl">
              <q>هنا حيث تصبح العلوم أبسط مما تتصور </q>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-16">
              <Link href="/blogs">
                <Button
                  size="lg"
                  className="text-lg cursor-pointer px-10 py-4 h-auto bg-[#295638] hover:bg-emerald-700 text-white transition-all duration-300 hover:scale-105"
                >
                  ابدأ رحلتك التعليمية
                </Button>
              </Link>
              <Link href="/blogs">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg cursor-pointer px-10 py-4 h-auto border-emerald-600 text-[#295638] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 hover:scale-105"
                >
                  تصفح المناهج
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative max-w-lg mx-auto">
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-emerald-100/30 dark:bg-emerald-900/20 rounded-full animate-pulse" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-slate-100/40 dark:bg-slate-800/30 rounded-full animate-pulse" />

              <div className="relative z-10">
                <div className="w-80 h-80 mx-auto rounded-full overflow-hidden border-8 border-white/60 dark:border-slate-800/60 backdrop-blur-sm shadow-2xl transition-transform duration-300 hover:scale-105">
                  <Image
                    src={teacherAkram}
                    alt="أستاذأكرم محمود "
                    className="w-full h-full object-cover"
                    priority
                    placeholder="blur"
                  />
                </div>

                <div className="absolute bottom-8 -left-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl transition-transform duration-300 hover:scale-105">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    أستاذ أكرم مسلم
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    معلم الاحياء
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
