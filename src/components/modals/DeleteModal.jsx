"use client";

import React from "react";
import { useTranslations } from "next-intl";

const DeleteModal = ({ isOpen, onClose, onConfirm, userName }) => {
  const t = useTranslations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50" >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <p className="text-gray-700 mb-6">
          {t("confirm_delete")} <strong>{userName}</strong>؟
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;