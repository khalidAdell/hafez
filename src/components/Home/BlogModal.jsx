"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { IoClose } from "react-icons/io5";

const BlogModal = ({ isOpen, onClose, content, locale }) => {
  const t = useTranslations();

  if (!isOpen || !content) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6 relative max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <IoClose size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {content.title}
        </h2>
        {content.image && (
          <Image
            src={content.image}
            width={600}
            height={400}
            alt={content.title}
            className="w-full h-auto object-cover rounded-lg mb-4"
          />
        )}
        <p className="text-gray-600 leading-relaxed">
          {content.description || content.short_description}
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0B7459] text-white py-2 px-4 rounded-lg hover:bg-[#0B7459]/90"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;