"use client";
import { MdSave } from "react-icons/md";
import { useTranslations } from "next-intl";

const SaveCancelButtons = ({
  onSave,
  onCancel,
  saveText,
  cancelText,
}) => {
  const t = useTranslations();

  return (
    <div className="mt-6 flex gap-3 justify-end">
      <button
        onClick={onSave}
        className="bg-gradient-to-r from-[#0B7459] to-[#0d8a68] text-white px-4 py-3 rounded-xl font-semibold
                   hover:from-[#096a4d] hover:to-[#0b7459] transform hover:scale-105 transition-all duration-200
                   shadow-lg hover:shadow-xl flex items-center gap-2"
        type="button"
      >
        <MdSave className="w-5 h-5" />
        {saveText || t("SaveChanges")}
      </button>
      <button
        onClick={onCancel}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        type="button"
      >
        {cancelText || t("cancel")}
      </button>
    </div>
  );
};

export default SaveCancelButtons;
