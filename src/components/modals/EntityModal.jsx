"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import FileUpload from "../FileUpload";

const EntityModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
  districts = [],
  associations = [],
  users = [],
  entityType = "user",
  fieldsConfig = [],
}) => {
  const t = useTranslations();

  const initializeFormData = () => {
    const data = {};
    fieldsConfig.forEach((field) => {
      if (field.type === "file") {
        data[field.name] = null;
      } else if (field.type === "select") {
        data[field.name] = initialData[field.name] ?? "";
      } else {
        data[field.name] = initialData[field.name] ?? "";
      }
    });
    return data;
  };

  const [formData, setFormData] = useState(initializeFormData());
  const [localDistricts, setLocalDistricts] = useState(districts);

  useEffect(() => {
    setLocalDistricts(districts);
  }, [districts]);

  useEffect(() => {
    setFormData(initializeFormData());
  }, [initialData, fieldsConfig]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name, file) => {
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      const field = fieldsConfig.find((f) => f.name === key);
      if (field?.type === "file") {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      } else if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    if (isEdit) {
      data.append("_method", "PUT");
    }

    onSubmit(data);
  };

  if (!isOpen) return null;

  const renderField = (field) => {
    switch (field.type) {
      case "text":
      case "email":
        return (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required={field.required}
          />
        );

      case "select":
        let options = field.options || [];

        if (field.name === "district_id") {
          options = localDistricts.map((district) => ({
            value: district.id,
            label: district.name,
          }));
        } else if (field.name === "association_id") {
          options = associations.map((association) => ({
            value: association.id,
            label: association.name,
          }));
        } else if (field.name === "user_id") {
          options = users.map((user) => ({ value: user.id, label: user.name }));
        }

        return (
          <select
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            disabled={field.disabled && !formData[field.dependsOn]}
            required={field.required}
          >
            {!isEdit && <option value="">{t("all")}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "file":
        return (
          <FileUpload
            name={field.name}
            onFileChange={handleFileChange}
            // عند التعديل أرسل الرابط المبدئي للصورة إن وجد لعرضها
            initialImage={initialData[field.name] || ""}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90%] overflow-auto">
        <h2 className="text-2xl font-bold text-[#0B7459] mb-4">
          {isEdit ? t(`edit_${entityType}`) : t(`add_${entityType}`)}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {fieldsConfig.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700">
                {t(field.label)}
              </label>
              {renderField(field)}
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

export default EntityModal;
