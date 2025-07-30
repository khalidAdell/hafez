"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function Navbar({ isLogin = false, forceScrolledStyle = false }) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [locale, setLocale] = useState("ar"); 
  useEffect(() => {
    if (isClient) {
      const path = window.location.pathname;
      const parts = path.split("/");
      const currentLocale = parts[1];
      if (currentLocale === "ar" || currentLocale === "en") {
        setLocale(currentLocale);
      }
    }
  }, [isClient]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const isNavStyled = isLogin || isScrolled || forceScrolledStyle;

  const switchLanguage = (newLocale) => {
    if (isClient) {
      const currentPathWithoutLocale = window.location.pathname.replace(/^\/[a-z]{2}/, "");
      router.push(`/${newLocale}${currentPathWithoutLocale}`);
      setLangDropdownOpen(false);
      setIsOpen(false);
    }
  };

  if (!isClient) {
    return null;
  }

  // رمز الأيقونة العالمية
  const GlobeIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  );

  return (
    <nav
      className={`nav fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isNavStyled ? "bg-white shadow-md" : "bg-transparent"
      } ${isLogin ? "active" : ""}`}
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-2">
        {/* اللوجو */}
        <Link href={`/${locale}`} className="flex items-center">
          <Image
            src={isNavStyled ? "/logo.png" : "/logo-white.png"}
            width={80}
            height={64}
            alt="Hafez Logo"
            className="h-16 w-28 sm:h-20 mr-3 transition-opacity duration-300 ease-in-out"
          />
        </Link>

        {/* أزرار وفتح القائمة */}
        <div className="flex md:order-2 gap-3 items-center">
          {/* زر اختيار اللغة (مخفي على الشاشات الصغيرة) */}
          <div className={`relative hidden md:flex`}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 ease-in-out hover:shadow-md ${
                isNavStyled
                  ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              }`}
              aria-label="تغيير اللغة"
            >
              <GlobeIcon />
              <span className="text-sm font-medium">
                {locale === "ar" ? "العربية" : "English"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  langDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                <button
                  onClick={() => switchLanguage("ar")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                    locale === "ar" ? "bg-green-50 text-[#0B7459] font-semibold" : "text-gray-700"
                  }`}
                  aria-current={locale === "ar" ? "true" : undefined}
                >
                  <span className="text-lg">🇸🇦</span>
                  <span>العربية</span>
                  {locale === "ar" && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => switchLanguage("en")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                    locale === "en" ? "bg-green-50 text-[#0B7459] font-semibold" : "text-gray-700"
                  }`}
                  aria-current={locale === "en" ? "true" : undefined}
                >
                  <span className="text-lg">🇺🇸</span>
                  <span>English</span>
                  {locale === "en" && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* زر الدخول أو لوحة التحكم */}
          <div className="hidden md:flex gap-2">
            {isLogin ? (
              <Link
                href={`/${locale}/admin`}
                className="rounded-xl bg-[#0B7459] text-white py-2 px-4 h-[44px] transition-colors duration-300 ease-in-out hover:bg-[#095d47]"
              >
                {t("dashboard")}
              </Link>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="rounded-xl bg-[#0B7459] text-white py-2 px-4 h-[44px] transition-colors duration-300 ease-in-out hover:bg-[#095d47]"
              >
                {t("login")}
              </Link>
            )}
          </div>

          {/* زر الهامبرغر للموبايل */}
          <button
            onClick={toggleMenu}
            className={`inline-flex items-center p-2 text-sm rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors duration-300 ease-in-out ${
              isNavStyled ? "text-gray-500" : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* قائمة التنقل */}
        <div
          className={`w-full md:flex md:w-auto md:order-1 transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-screen opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-4 overflow-hidden md:opacity-100 md:translate-y-0 md:max-h-full pointer-events-none md:pointer-events-auto md:z-auto"
          }`}
        >
          <ul
            className={`flex flex-col p-4 mt-4 rounded-lg md:flex-row md:gap-5 gap-4 md:mt-0 md:text-sm lg:text-lg lg:gap-8 transition-colors duration-300 ease-in-out text-center ${
              isNavStyled ? "text-gray-900 bg-white" : "text-[#ffffffbf] max-sm:bg-[#000000c5]"
            }`}
          >
            <li className="border-b border-gray-200 md:border-none py-2">
              <Link
                href={`/${locale}`}
                className="hover:text-[#0B7459] transition-colors duration-300 ease-in-out"
                onClick={() => setIsOpen(false)}
              >
                {t("home")}
              </Link>
            </li>
            <li className="border-b border-gray-200 md:border-none py-2">
              <Link
                href={`/${locale}/#about`}
                className="hover:text-[#0B7459] transition-colors duration-300 ease-in-out"
                onClick={() => setIsOpen(false)}
              >
                {t("about")}
              </Link>
            </li>
            <li className="border-b border-gray-200 md:border-none py-2">
              <Link
                href={`/${locale}/#features`}
                className="hover:text-[#0B7459] transition-colors duration-300 ease-in-out"
                onClick={() => setIsOpen(false)}
              >
                {t("services")}
              </Link>
            </li>
            <li className="border-b border-gray-200 md:border-none py-2">
              <Link
                href={`/${locale}/faq`}
                className="hover:text-[#0B7459] transition-colors duration-300 ease-in-out"
                onClick={() => setIsOpen(false)}
              >
                {t("faq")}
              </Link>
            </li>
            <li className="border-b border-gray-200 md:border-none py-2">
              <Link
                href={`/${locale}/#contact`}
                className="hover:text-[#0B7459] transition-colors duration-300 ease-in-out"
                onClick={() => setIsOpen(false)}
              >
                {t("contact")}
              </Link>
            </li>
            <li className="flex justify-center gap-2 md:hidden py-2">
              <Link
                href={`/${locale}/login`}
                className="rounded-xl bg-[#0B7459] text-white py-2 px-4 transition-colors duration-300 ease-in-out hover:bg-[#095d47]"
                onClick={() => setIsOpen(false)}
              >
                {t("login")}
              </Link>
            </li>
            <li className="flex justify-center gap-2 md:hidden py-2">
              <div className="flex gap-2">
                <button
                  onClick={() => switchLanguage("ar")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
                    locale === "ar"
                      ? "bg-[#0B7459] text-white border-[#0B7459]"
                      : "bg-white/10 text-gray-500 border-gray-800 hover:bg-white/20"
                  }`}
                  aria-current={locale === "ar" ? "true" : undefined}
                >
                  <span>🇸🇦</span>
                  <span className="text-sm">العربية</span>
                </button>
                <button
                  onClick={() => switchLanguage("en")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
                    locale === "en"
                      ? "bg-[#0B7459] text-white border-[#0B7459]"
                      : "bg-white/10 text-gray-500 border-gray-600 hover:bg-white/20"
                  }`}
                  aria-current={locale === "en" ? "true" : undefined}
                >
                  <span>🇺🇸</span>
                  <span className="text-sm">English</span>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
