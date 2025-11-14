import Image from "next/image";
import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconPhone,
} from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white" id="contact">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="text-center md:text-right">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              تواصل مع المعلم
            </h2>
            <p className="mb-6 text-lg text-gray-300">
              لديك سؤال أو استفسار؟ لا تتردد في التواصل معنا عبر الطرق التالية.
            </p>
            <div className="flex flex-col items-center gap-4 md:items-start">
              <Link
                href="https://wa.me/YOUR_WHATSAPP_NUMBER"
                target="_blank"
                className="flex items-center gap-3 text-lg transition-colors hover:text-cyan-400"
              >
                <IconBrandWhatsapp size={28} />
                <span>تواصل عبر واتساب</span>
              </Link>
              <Link
                href="https://facebook.com/YOUR_FACEBOOK_PAGE"
                target="_blank"
                className="flex items-center gap-3 text-lg transition-colors hover:text-cyan-400"
              >
                <IconBrandFacebook size={28} />
                <span>صفحتنا على فيسبوك</span>
              </Link>
              <div className="flex items-center gap-3 text-lg">
                <IconPhone size={28} />
                <span>+20 123 456 7890</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative h-64 w-64 overflow-hidden rounded-full border-4 border-cyan-500 md:h-80 md:w-80">
              <Image
                src="/teacher.png"
                alt="الأستاذ أكرم"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
