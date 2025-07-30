"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useTranslations } from "next-intl"; 
import { IoArrowBackSharp } from "react-icons/io5";

const Blogs = ({ blogs }) => {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "ar";
  const t = useTranslations(); 
  const [selectedBlog, setSelectedBlog] = useState(null);


  if (!blogs || blogs.length === 0) {
    return <div className="text-center py-10">{t("no-blogs")}</div>;
  }

  return (
    <div>
      <section className="text-gray-600 mb-20">
        <div className="container mx-auto px-5 py-10">
          <div className="text-center mb-5">
            <h2 className="x-title text-2xl font-bold text-primary">
              {t("title")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 grid-cols-1 md:gap-8 gap-5">
            {blogs.map((blog) => (
              <div key={blog.id} className="p-4">
                <div className="h-full border-2 border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={blog.image}
                    width={300}
                    height={200}
                    alt={blog.title}
                    className="lg:h-48 md:h-36 w-full object-cover"
                  />
                  <div className="p-6">
                    <h1 className="text-lg font-medium text-gray-900 mb-3">
                      {blog.title}
                    </h1>
                    <p className="leading-relaxed mb-3 text-sm">
                      {blog.short_description.length > 150
                        ? blog.short_description.slice(0, 150) + "..."
                        : blog.short_description}
                    </p>
                    <Link
                         href={`/${locale}/blogs/${blog.id || ""}`}
                        className="inline-flex items-center hover:underline text-[#0B7459]"
                      >
                        {t("blogshow")}
                        <IoArrowBackSharp className="mx-1 ltr:rotate-180" />
                      </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-5">
            <Link
              href={`/${locale}/blogs`}
              className="x-btn x-btn-outline border border-[#0B7459] text-[#0B7459] py-2 px-4 rounded-xl hover:text-white hover:bg-[#0B7459]"
            >
              {t("view-all")}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Blogs;