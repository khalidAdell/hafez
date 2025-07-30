"use client";
import { IoChevronForward } from "react-icons/io5";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function DashboardPath({ pageTitle, backUrl, addUrl }) {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <div className="bg-white shadow-sm p-4 mb-6 rounded-lg">
      <div className="flex items-center justify-between flex-wrap">
        {/* Page Path */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-gray-600 text-lg font-medium">
            <Link
              href="/dashboard"
              className="hover:underline text-gray-600 text-lg font-medium"
            >
              {t("dashboardHome")}
            </Link>
            <span>›</span>
            <span className="text-gray-600 text-lg font-medium">
              {pageTitle}
            </span>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex items-center gap-3">
          <Link
            href={backUrl || "/dashboard"}
            className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1"
            title={t("back")}
          >
            <span className="text-gray-600 text-lg font-medium">
              {t("back")}
            </span>
            <IoChevronForward
              className={`h-6 w-6 text-gray-600 ${isArabic ? "rotate-180" : ""}`}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
