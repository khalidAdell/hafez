import Navbar from "../../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import path from "path";
import fs from "fs/promises";
import createAxiosInstance from "../../../lib/axiosInstance";
import { IoArrowBackSharp } from "react-icons/io5";

export const metadata = {
  title: "حافظ | المدونات",
  description: "تصفح أحدث المقالات والمدونات على منصة حافظ",
};

export const revalidate = 60;

export default async function BlogsPage({ params }) {
  const { locale } = params;

  const axiosInstance = createAxiosInstance(locale);

  const messagesPath = path.join(process.cwd(), "messages", `${locale}.json`);
  let messages = {};
  try {
    const messagesContent = await fs.readFile(messagesPath, "utf8");
    messages = JSON.parse(messagesContent);
  } catch (error) {
    console.error("Error loading translations:", error);
  }

  const t = (key) => messages[key] || key;

  let blogs = [];
  try {
    const response = await axiosInstance.get("/blogs");
    blogs = Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }

  blogs = blogs.map((blog) => {
    const isValidImage = blog.image && blog.image.startsWith("http");
    return {
      ...blog,
      image: isValidImage ? blog.image : "/about-1.jpg",
    };
  });

  return (
    <div>
      <Navbar forceScrolledStyle={true} />
      <section className="text-gray-600 mb-20">
        <div className="container mx-auto px-5 py-10">
          <div className="text-center mb-5">
            <h2 className="x-title text-2xl font-bold text-primary">{t("Blog")}</h2>
          </div>

          <div className="grid md:grid-cols-4 grid-cols-1 md:gap-8 gap-5">
            {blogs.length > 0 ? (
              blogs.map((blog, index) => (
                <div key={`blog-${blog.id || index}`} className="p-4">
                  <div className="h-full border-2 border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={blog.image}
                      width={300}
                      height={200}
                      alt={blog.title || "Blog Image"}
                      className="lg:h-48 md:h-36 w-full h-32 object-cover"
                    />
                    <div className="p-6">
                      <h1 className="text-lg font-medium text-gray-900 mb-3">
                        {blog.title || "بدون عنوان"}
                      </h1>
                      <p className="leading-relaxed mb-3 text-sm">
                        {(blog.short_description || "بدون وصف").slice(0, 150)}...
                      </p>
                      <Link
                        href={`/${locale}/blogs/${blog.id}`}
                        className="inline-flex items-center hover:underline text-[#0B7459]"
                      >
                        {t("blogshow")}
                        <IoArrowBackSharp className="mx-1 ltr:rotate-180" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center">{t("no-data")}</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
