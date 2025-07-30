"use client";

import { useTranslations } from 'next-intl';
import { IoPencil, IoTrash } from 'react-icons/io5';

export default function CustomActions({ articleId }) {
  const t = useTranslations();
  const handleEdit = () => {
    console.log(`Edit article with ID: ${articleId}`);
  };

  const handleDelete = () => {
    console.log(`Delete article with ID: ${articleId}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleEdit}
        className="p-[6px] bg-[#0B7459] text-white rounded-lg hover:bg-[#096a4d] transition-colors"
        title={t("edit")}
      >
        <IoPencil className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-[6px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        title={t("delete")}
      >
        <IoTrash className="h-4 w-4" />
      </button>
    </div>
  );
}