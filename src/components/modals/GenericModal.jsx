// src/app/[locale]/dashboard/mosques/GenericModal.jsx
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import CustomFilePicker from "../CustomFilePicker";
import DeviceFileUpload from "../DeviceFileUpload";
import Select from "react-select";

const GenericModal = ({
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

  // Initialize formData with initialData
  useEffect(() => {
    const initializedData = {};
    fieldsConfig.forEach((field) => {
      let value = initialData[field.name] || "";
      // Handle nested fields if specified in fieldsConfig
      if (field.nestedPath) {
        const nestedValue = field.nestedPath.split(".").reduce((obj, key) => obj?.[key], initialData);
        value = nestedValue !== undefined ? String(nestedValue) : value;
      }
      initializedData[field.name] = value;
    });
    // Handle image fields
    initializedData.image_id = initialData.image_id || initialData.image ||initialData.upload_id || "";
    initializedData.image_url = initialData.image_url || "";
    setFormData(initializedData);
  }, [initialData, fieldsConfig]);

  // Fetch districts when city_id changes or on initial load
  useEffect(() => {
    const districtField = fieldsConfig.find((f) => f.name === "district_id");
    if (
      districtField &&
      districtField.dependsOn === "city_id" &&
      formData.city_id &&
      fetchDependencies.district_id
    ) {
      const fetchDistrictsForCity = async () => {
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
      };
      fetchDistrictsForCity();
    } else if (districtField && (formData.district_id || formData.association_id)) {
      // Reset dependent fields if city_id is missing or fetchDependencies.district_id is absent
      setFormData((prev) => ({ ...prev, district_id: "", association_id: "" }));
      setDistrictOptions([]);
    }
  }, [formData.city_id, fetchDependencies.district_id, isEdit, t, fieldsConfig]);

  // Fetch associations when city_id and district_id change or on initial load
  useEffect(() => {
    const associationField = fieldsConfig.find((f) => f.name === "association_id");
    if (
      associationField &&
      Array.isArray(associationField.dependsOn) &&
      associationField.dependsOn.includes("city_id") &&
      associationField.dependsOn.includes("district_id") &&
      formData.city_id &&
      formData.district_id &&
      fetchDependencies.association_id
    ) {
      const fetchAssociationsForCityAndDistrict = async () => {
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
      };
      fetchAssociationsForCityAndDistrict();
    } else if (associationField && formData.association_id) {
      // Reset association_id if dependencies are missing
      setFormData((prev) => ({ ...prev, association_id: "" }));
      setAssociationOptions([]);
    }
  }, [formData.city_id, formData.district_id, fetchDependencies.association_id, isEdit, t, fieldsConfig]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const field = fieldsConfig.find((f) => f.name === name);

    if (field && field.dependsOn) {
      if (name === "city_id" && setCityId) {
        setCityId(value);
        setFormData((prev) => ({ ...prev, district_id: "", association_id: "", [name]: value }));
      } else if (name === "district_id") {
        setFormData((prev) => ({ ...prev, association_id: "", [name]: value }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (name, file, imageId, imageUrl) => {    
    setFormData((prev) => ({
      ...prev,
      [name]: file,
      image_id: imageId || prev.image_id || prev.upload_id || prev.icon,
      icon: name === "icon" ? imageId || prev.image_id || prev.upload_id || prev.icon : prev.icon,
      image_url: imageUrl || prev.image_url,
      image: imageId || prev.image_id,
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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute w-full h-full bg-black/50"
      onClick={onClose}
      />
      <div className="bg-white rounded-lg p-6 relative w-full max-w-md max-h-[90%] overflow-auto">
        <button
          type="button"
          className="absolute top-4 ltr:right-4 rtl:left-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
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
           <Select
           name={field.name}
           isDisabled={
             field.dependsOn
               ? Array.isArray(field.dependsOn)
                 ? !field.dependsOn.every((dep) => formData[dep])
                 : !formData[field.dependsOn]
               : false
           }
           options={[
             { value: "", label: t("all") },
             ...(field.name === "district_id"
               ? districtOptions
               : field.name === "association_id"
               ? associationOptions
               : (field.options || []).map((option) => ({
                   value: option.value || option.id,
                   label: option.label || option.name,
                 }))),
           ]}
           value={
             (
               [
                 { value: "", label: t("all") },
                 ...(field.name === "district_id"
                   ? districtOptions
                   : field.name === "association_id"
                   ? associationOptions
                   : (field.options || []).map((option) => ({
                       value: option.value || option.id,
                       label: option.label || option.name,
                     }))),
               ].find((opt) => opt.value === formData[field.name]) || {
                 value: "",
                 label: t("all"),
               }
             )
           }
           onChange={(selectedOption) => {
             const fakeEvent = {
               target: {
                 name: field.name,
                 value: selectedOption?.value || "",
               },
             };
             handleChange(fakeEvent);
           }}
           className="react-select-container"
           classNamePrefix="react-select"
         />
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
                  imageId={formData.image_id || formData.upload_id || formData.icon || formData.image}
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

export default GenericModal;