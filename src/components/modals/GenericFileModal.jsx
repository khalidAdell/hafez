import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import CustomFilePicker from "../CustomFilePicker";
import DeviceFileUpload from "../DeviceFileUpload";

const GenericFileModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
  fieldsConfig = [],
  fetchDependencies = {},
  locale,
}) => {
  const t = useTranslations();
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    // Only update formData if initialData has meaningful changes
    if (
      JSON.stringify(formData) !==
      JSON.stringify({
        ...initialData,
        image_id: initialData.image_id || initialData.image || "",
        image_url: initialData.image_url || "",
      })
    ) {
      setFormData({
        ...initialData,
        image_id: initialData.image_id || initialData.image || "",
        image_url: initialData.image_url || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name, file) => {
    setFormData((prev) => ({
      ...prev,
      [name]: file,
      image_id: file ? prev.image_id : "",
      image_url: file ? URL.createObjectURL(file) : prev.image_url,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    for (const field of fieldsConfig) {
      if (field.required && !formData[field.name] && field.name !== "image") {
        toast.error(t(`${field.label}_required`), { autoClose: 3000 });
        return;
      }
      if (field.required && field.name === "file" && !formData[field.name]) {
        toast.error(t("file_required"), { autoClose: 3000 });
        return;
      }
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "file" && formData[key]) {
        data.append("file", formData[key]);
      } else if (formData[key] !== null && formData[key] !== "" && key !== "image_url") {
        data.append(key, formData[key]);
      }
    });

    if (isEdit) {
      data.append("_method", "PUT");
    }

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90%] overflow-auto">
        <h2 className="text-2xl font-bold text-[#0B7459] mb-4">
          {isEdit ? t("edit_entity") : t("add_entity")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fieldsConfig.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700">{t(field.label)}</label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={field.dependsOn && !formData[field.dependsOn]}
                >
                  <option value="">{t("all")}</option>
                  {(field.options || []).map((option) => (
                    <option key={option.value || option.id} value={option.value || option.id}>
                      {option.label || option.name}
                    </option>
                  ))}
                </select>
              ) : field.type === "image-picker" ? (
                <CustomFilePicker
                  name={field.name}
                  onFileChange={handleFileChange}
                  locale={locale}
                  imageUrl={formData.image_url}
                  imageId={formData.image_id}
                />
              ) : field.type === "file" ? (
                <DeviceFileUpload
                  name={field.name}
                  onFileChange={handleFileChange}
                  initialImage={initialData[field.name] || ""}
                />
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required={field.required || false}
                  placeholder={t(field.label)}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B7459] text-white rounded-lg hover:bg-[#096a4d]"
            >
              {isEdit ? t("update") : t("add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenericFileModal;