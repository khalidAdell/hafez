"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function FaqList({ faqs, locale }) {
  const t = useTranslations();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
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
  );
}