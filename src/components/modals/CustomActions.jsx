"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { IoPencil, IoTrash } from "react-icons/io5";

const CustomActions = ({ userId, onEdit, onDelete }) => {
  const t = useTranslations();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onEdit(userId)}
        className="p-2 text-[#0B7459] hover:bg-gray-100 rounded-lg"
        title={t("edit")}
      >
        <IoPencil className="h-5 w-5" />
      </button>
      <button
        onClick={() => onDelete(userId)}
        className="p-2 text-red-600 hover:bg-gray-100 rounded-lg"
        title={t("delete")}
      >
        <IoTrash className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CustomActions;