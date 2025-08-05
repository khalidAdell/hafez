// src/app/[locale]/dashboard/mosques/MosqueModal.jsx
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import CustomFilePicker from "../../../../components/CustomFilePicker";
import DeviceFileUpload from "../../../../components/DeviceFileUpload";

const MosqueModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
  fieldsConfig = [],
  fetchDependencies = {},
  locale,
  setCityId = null,
}) => {
  const t = useTranslations();
  const [formData, setFormData] = useState({});
  const [districtOptions, setDistrictOptions] = useState([]);
  const [associationOptions, setAssociationOptions] = useState([]);

  // Initialize formData with initialData, flattening nested IDs
  useEffect(() => {
    const flattenedData = {
      ...initialData,
      image_id: initialData.image_id || initialData.image || "",
      image_url: initialData.image_url || "",
      city_id: initialData.district?.city?.id ? String(initialData.district.city.id) : String(initialData.city_id || ""),
      district_id: initialData.district?.id ? String(initialData.district.id) : String(initialData.district_id || ""),
      association_id: initialData.association?.id ? String(initialData.association.id) : String(initialData.association_id || ""),
      user_id: initialData.user?.id ? String(initialData.user.id) : String(initialData.user_id || ""),
    };
    setFormData(flattenedData);
  }, [initialData]);

  // Fetch districts when city_id changes or on initial load
  useEffect(() => {
    const fetchDistrictsForCity = async () => {
      if (formData.city_id && fetchDependencies.district_id) {
        try {
          const districts = await fetchDependencies.district_id(formData.city_id);
          const options = districts.map((district) => ({
            value: String(district.id),
            label: district.name,
          }));
          setDistrictOptions(options);
          // Validate district_id in edit mode
          if (isEdit && formData.district_id && !options.find((opt) => opt.value === formData.district_id)) {
            setFormData((prev) => ({ ...prev, district_id: "", association_id: "" }));
          }
        } catch (error) {
          toast.error(t("error_loading_districts"), { autoClose: 3000 });
          setDistrictOptions([]);
          setFormData((prev) => ({ ...prev, district_id: "", association_id: "" }));
        }
      } else {
        setDistrictOptions([]);
        if (formData.district_id || formData.association_id) {
          setFormData((prev) => ({ ...prev, district_id: "", association_id: "" }));
        }
      }
    };

    fetchDistrictsForCity();
  }, [formData.city_id, fetchDependencies, t, isEdit]);

  // Fetch associations when city_id and district_id change or on initial load
  useEffect(() => {
    const fetchAssociationsForCityAndDistrict = async () => {
      if (formData.city_id && formData.district_id && fetchDependencies.association_id) {
        try {
          const associations = await fetchDependencies.association_id(
            formData.city_id,
            formData.district_id
          );
          const options = associations.map((assoc) => ({
            value: String(assoc.id),
            label: assoc.name,
          }));
          setAssociationOptions(options);
          // Validate association_id in edit mode
          if (isEdit && formData.association_id && !options.find((opt) => opt.value === formData.association_id)) {
            setFormData((prev) => ({ ...prev, association_id: "" }));
          }
        } catch (error) {
          toast.error(t("error_loading_associations"), { autoClose: 3000 });
          setAssociationOptions([]);
          setFormData((prev) => ({ ...prev, association_id: "" }));
        }
      } else {
        setAssociationOptions([]);
        if (formData.association_id) {
          setFormData((prev) => ({ ...prev, association_id: "" }));
        }
      }
    };

    fetchAssociationsForCityAndDistrict();
  }, [formData.city_id, formData.district_id, fetchDependencies, t, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "city_id" && setCityId) {
      setCityId(value);
      setFormData((prev) => ({ ...prev, district_id: "", association_id: "", [name]: value }));
    } else if (name === "district_id") {
      setFormData((prev) => ({ ...prev, association_id: "", [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (name, file, imageId, imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      [name]: file,
      image_id: imageId || prev.image_id,
      image_url: imageUrl || prev.image_url,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    for (const field of fieldsConfig) {
      if (field.required && !formData[field.name]) {
        toast.error(t(`${field.label}_required`), { autoClose: 3000 });
        return;
      }
    }

    const data = new FormData();
    fieldsConfig.forEach((field) => {
      const key = field.imageField || field.name;
      const value = formData[field.name];
      if (typeof value !== "undefined" && value !== null && value !== "") {
        data.append(key, value);
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
              <label className="block text-sm font-medium text-gray-700">
                {t(field.label)}
              </label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={formData[field.name] || ""}
                  disabled={
                    field.dependsOn
                      ? Array.isArray(field.dependsOn)
                        ? !field.dependsOn.every((dep) => formData[dep])
                        : !formData[field.dependsOn]
                      : false
                  }
                >
                  <option value="">{t("all")}</option>
                  {field.name === "district_id"
                    ? districtOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    : field.name === "association_id"
                    ? associationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    : (field.options || []).map((option) => (
                        <option
                          key={option.value || option.id}
                          value={option.value || option.id}
                        >
                          {option.label || option.name}
                        </option>
                      ))}
                </select>
              ) : field.type === "date" ? (
                <input
                  type="date"
                  name={field.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={
                    field.dependsOn
                      ? Array.isArray(field.dependsOn)
                        ? !field.dependsOn.every((dep) => formData[dep])
                        : !formData[field.dependsOn]
                      : false
                  }
                />
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

export default MosqueModal;