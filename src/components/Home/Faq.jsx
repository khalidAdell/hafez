"use client"
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const Faq = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";

  return (
    <div>
      {/* FAQ Section */}
      <section className="text-gray-600 mb-20">
        <div className="container mx-auto flex">
          <div className="w-full relative bg-gray-100 py-32 px-10 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image src="/bg-faq.jpg" fill style={{}} alt="gallery" />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 z-0"></div>

            {/* Text Content */}
            <div className="text-center relative z-10">
              <h2 className="text-4xl text-white font-bold mb-2">
                {t("title")}
              </h2>
              <p className="leading-relaxed text-gray-200 my-5">
                {t("description")}
              </p>
              <Link
                href={`/${locale}/faq`}
                className="x-btn x-btn-white x-btn-outline text-white py-2 px-4 rounded border border-white hover:bg-[#27433c]  duration-300 "
              >
                {t("knowmore")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faq;
