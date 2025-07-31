"use client";
import { useTranslations } from "next-intl";
import Navbar from "../../../components/Navbar";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import createAxiosInstance from "../../../lib/axiosInstance";

const Faq = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar"; 
  const t = useTranslations();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // Create Axios instance with locale
  const axiosInstance = createAxiosInstance(locale);

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axiosInstance.get("/faq");
        if (response.data.success) {
          setFaqs(response.data.data);
        } else {
          setFaqs([]);
          setError(t("no-faqs"));
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setError(t("fetch-error"));
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [t, locale]); 

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{}</p> 
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <section className="text-gray-600 mb-20">
          <div className="container mx-auto flex">
            <div className="w-full relative bg-gray-900 py-40 px-10 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image
                  src="/bg-faq.jpg"
                  fill
                  style={{ objectFit: "cover" }}
                  alt="gallery"
                  className="w-full h-full object-cover opacity-40"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/90 z-0"></div>
              <div className="text-center relative z-10 max-w-4xl mx-auto">
                <div className="mb-6">
                  <span className="inline-block w-16 h-1 bg-[#0B7459] mb-6"></span>
                </div>
                <h2 className="text-5xl md:text-6xl text-white font-bold mb-6 leading-tight">
                  {t("faq")}
                </h2>
                <p className="text-xl leading-relaxed text-gray-300 max-w-2xl mx-auto">
                  {t("faq-det")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {t("faq-help")}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("faq-browse")}
              </p>
            </div>

            <div className="md:w-3/4 lg:w-2/3 xl:w-1/2 w-full mx-auto">
              <div className="space-y-4">
                {faqs.length > 0 ? (
                  faqs.map((faq, index) => (
                    <div key={faq.id} className="group">
                      <div
                        className={`
                          bg-white rounded-2xl shadow-md hover:shadow-xl 
                          transition-all duration-300 border-2 overflow-hidden
                          ${
                            openFaq === index
                              ? "border-[#0B7459] shadow-lg shadow-[#0B7459]/10"
                              : "border-transparent hover:border-[#0B7459]/30"
                          }
                        `}
                      >
                        <div
                          className="cursor-pointer transition-all duration-300"
                          onClick={() => toggleFaq(index)}
                        >
                          <div
                            className={`
                              p-6 flex justify-between items-center
                              ${
                                openFaq === index
                                  ? "bg-[#0B7459] text-white"
                                  : "hover:bg-gray-50"
                              }
                            `}
                          >
                            <h3
                              className={`
                                text-lg font-semibold transition-colors duration-300
                                ${
                                  openFaq === index
                                    ? "text-white"
                                    : "text-gray-800 group-hover:text-[#0B7459]"
                                }
                              `}
                            >
                              {faq.name}
                            </h3>
                            <div
                              className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                transition-all duration-300 transform
                                ${
                                  openFaq === index
                                    ? "bg-white/20 rotate-180"
                                    : "bg-[#0B7459]/10 group-hover:bg-[#0B7459]/20"
                                }
                              `}
                            >
                              <span
                                className={`
                                  text-sm transform transition-all duration-300
                                  ${
                                    openFaq === index
                                      ? "text-white"
                                      : "text-[#0B7459]"
                                  }
                                `}
                              >
                                ▼
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`
                            transition-all duration-500 ease-in-out overflow-hidden
                            ${
                              openFaq === index
                                ? "max-h-96 opacity-100"
                                : "max-h-0 opacity-0"
                            }
                          `}
                        >
                          <div className="p-6 pt-0 border-t border-gray-100">
                            <div className="pt-4">
                              <p className="text-gray-600 leading-relaxed text-base">
                                {faq.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-gray-400">؟</span>
                    </div>
                    <p className="text-gray-600 text-lg">{t("no-faqs")}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-16">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {t("noAnswerTitle")}
                </h3>
                <p className="text-gray-600 mb-6">{t("noAnswerDescription")}</p>
                <Link
                  href={`/${locale}/#contact`}
                  className="bg-[#0B7459] hover:bg-[#0B7459]/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  {t("contactUs")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Faq;