import Navbar from "../../../../components/Navbar"
import path from "path"
import fs from "fs/promises"
import createAxiosInstance from "../../../../lib/axiosInstance"
import { IoArrowBackSharp, IoCalendarOutline, IoTimeOutline } from "react-icons/io5"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "حافظ | مقالة",
  description: "عرض المقالة المفصلة",
}

export const revalidate = 60

export default async function BlogDetailPage({ params }) {
  const { locale, id } = await params

  // إنشاء حدث axios مع locale
  const axiosInstance = createAxiosInstance(locale)

  // تحميل الترجمة
  const messagesPath = path.join(process.cwd(), "messages", `${locale}.json`)
  let messages = {}
  try {
    const messagesContent = await fs.readFile(messagesPath, "utf8")
    messages = JSON.parse(messagesContent)
  } catch (error) {
    console.error("Error loading translations:", error)
  }

  const t = (key) => messages[key] || key

  // جلب بيانات المقالة حسب id
  let blog = null
  try {
    const response = await axiosInstance.get(`/blogs/${id}`)
    blog = response.data.data
  } catch (error) {
    console.error("Error fetching blog detail:", error)
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        <Navbar forceScrolledStyle={true} />
        <div className="container mx-auto px-4 py-20  ">
          <div className="max-w-2xl mx-auto text-center ">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("no-data")}</h2>
              <p className="text-gray-600 mb-8">لم يتم العثور على المقالة المطلوبة</p>
              <Link
                href={`/${locale}/blogs`}
                className="inline-flex items-center px-6 py-3 bg-[#0B7459] text-white rounded-lg hover:bg-[#0a6249] transition-colors duration-200 font-medium"
              >
                <IoArrowBackSharp className="mx-2 ltr:rotate-180" />
                {t("back-to-blogs")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar forceScrolledStyle={true} />

      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href={`/${locale}/blogs`}
              className="inline-flex items-center text-[#0B7459] hover:text-[#0a6249] transition-colors duration-200 mb-8 group"
            >
              <IoArrowBackSharp className="mx-2 ltr:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">{t("back-to-blogs")}</span>
            </Link>

            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                {blog.title || "بدون عنوان"}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <IoCalendarOutline className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {blog.created_at_human || new Date(blog.created_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
            
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image */}
            {blog.image && (
              <div className="mb-12">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <Image
                    src={blog.image || "/placeholder.svg"}
                    alt={blog.title || "Blog Image"}
                    width={1200}
                    height={600}
                    className="w-full h-[400px] md:h-[500px] object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            )}

            {/* Article Body */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="prose prose-lg prose-gray max-w-none">
                <div
                  className="text-gray-800 leading-relaxed text-lg"
                  style={{
                    lineHeight: "1.8",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {blog.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: blog.content }}
                      className="prose-headings:text-gray-900 prose-headings:font-bold prose-p:mb-6 prose-p:text-gray-800 prose-a:text-[#0B7459] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:my-6 prose-li:mb-2"
                    />
                  ) : (
                    <p className="text-gray-800 whitespace-pre-line">{blog.short_description || "بدون وصف"}</p>
                  )}
                </div>
              </div>

       
            </div>

            {/* Navigation */}
            <div className="mt-12 text-center">
              <Link
                href={`/${locale}/blogs`}
                className="inline-flex items-center px-8 py-4 bg-[#0B7459] text-white rounded-xl hover:bg-[#0a6249] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <IoArrowBackSharp className="mx-2 ltr:rotate-180" />
                {t("back-to-blogs")}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
