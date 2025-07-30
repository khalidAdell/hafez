"use client";
import { FiUpload } from "react-icons/fi";
import { useTranslations } from "next-intl";

const FileUploadArea = ({ label, icon: Icon, file, onChange, previewSize = "w-24 h-24" }) => {
  const t = useTranslations();

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className="w-4 h-4 text-[#0B7459]" />
        {label}
      </label>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0B7459] hover:bg-gray-50 transition-all duration-200">
          {file ? (
            <div className="space-y-3">
              <img
                src={file || "/placeholder.svg"}
                alt="Preview"
                className={`${previewSize} object-contain mx-auto rounded-lg shadow-sm`}
              />
              <p className="text-sm text-gray-600">{t("clickToChange")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <FiUpload className="w-8 h-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t("clickToUpload")}</p>
                <p className="text-xs text-gray-500">{t("fileTypes")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadArea;
