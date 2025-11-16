import Image from "next/image";
import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconPhone,
} from "@tabler/icons-react";

export default function Footer() {
  const contactLinks = [
    {
      href: "https://wa.me/01060312701",
      icon: IconBrandWhatsapp,
      label: "تواصل عبر واتساب",
      color: "hover:text-emerald-400",
      bgColor: "hover:bg-emerald-400/10",
    },
    {
      href: "https://facebook.com/akrmmusallam",
      icon: IconBrandFacebook,
      label: "صفحتنا على فيسبوك",
      color: "hover:text-blue-400",
      bgColor: "hover:bg-blue-400/10",
    },
    {
      href: "tel:+201060312701",
      icon: IconPhone,
      label: "+20 10 60312701",
      color: "hover:text-cyan-400",
      bgColor: "hover:bg-cyan-400/10",
    },
  ];

  return (
    <footer
      className="relative bg-gradient-to-b from-gray-950 to-black text-white overflow-hidden"
      id="contact"
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Gradient orbs for subtle visual interest */}
      <div className="absolute top-0 right-1/4 h-96 w-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-96 w-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Contact Information */}
          <div className="text-center lg:text-right space-y-8">
            <div className="space-y-3">
              <div className="inline-block">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-l from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  تواصل مع المعلم
                </h2>
                <div className="h-1 bg-gradient-to-l from-cyan-400 to-blue-400 rounded-full mt-2" />
              </div>
              <p className="text-lg md:text-xl text-gray-400 max-w-md mx-auto lg:mx-0">
                لديك سؤال أو استفسار؟ نحن هنا لمساعدتك في أي وقت
              </p>
            </div>

            {/* Contact Links */}
            <div className="flex flex-col gap-3 max-w-md mx-auto lg:mx-0">
              {contactLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  className={`group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 ${link.color} ${link.bgColor} hover:border-white/20 hover:scale-[1.02]`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <link.icon
                      size={24}
                      className="transition-transform group-hover:scale-110"
                    />
                  </div>
                  <span className="text-lg font-medium text-gray-200 group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Additional Info */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-sm text-gray-500">
                متاح للرد على استفساراتكم يومياً
              </p>
            </div>
          </div>

          {/* Teacher Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              {/* Animated border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full opacity-75 group-hover:opacity-100 blur-sm transition-opacity duration-300 animate-pulse" />

              {/* Image container */}
              <div className="relative h-72 w-72 md:h-96 md:w-96 rounded-full overflow-hidden border-4 border-gray-900 bg-gray-900">
                <Image
                  src="/akram-2.jpeg"
                  alt="الأستاذ أكرم"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-600 px-6 py-2 rounded-full">
                <p className="text-sm font-bold text-white whitespace-nowrap">
                  الأستاذ أكرم مسلم
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
            <p className="text-gray-600">صُنع بـ ❤️ لطلابنا الأعزاء</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
