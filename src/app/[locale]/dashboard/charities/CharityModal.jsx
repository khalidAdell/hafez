import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomFilePicker from "../../../../components/CustomFilePicker";
import { useTranslations } from "next-intl";
import Select from "react-select";

const defaultState = {
  name_ar: "",
  name_en: "",
  auth_image_id: "",
  auth_image_url: "",
  logo_id: "",
  logo_url: "",
  auth_number: "",
  status: "active",
  city_id: "",
  district_id: "",
};

export default function CharityModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
  cities = [],
  districts = [],
  locale = "ar",
  setCityId,
}) {
  
  const [form, setForm] = useState(defaultState);
  const [districtOptions, setDistrictOptions] = useState(districts);
  const [errors, setErrors] = useState({});
  const t = useTranslations();

  useEffect(() => {
    console.log(form.city_id);
    console.log(districtOptions);
    
    setDistrictOptions(districts.filter((district) => district.city_id == form.city_id));
  }, [form.city_id]);

  useEffect(() => {
    setForm({ ...defaultState, ...initialData });
  }, [initialData, isOpen]);

  const handleChange = (e) => {
      const { name, value, type, files } = e.target;
      console.log(name, value);
    let val = type === "file" ? files[0] : value;
    setForm((prev) => {
      const updated = { ...prev, [name]: val };
      if (name === "city_id") {
        updated.district_id = "";
      }
      return updated;
    });
  };
  // Handle CustomFilePicker change
  const onFileChange = (name, _file, imageId, imageUrl) => {
    setForm((prev) => ({
      ...prev,
      [name + "_id"]: imageId,
      [name + "_url"]: imageUrl,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name_ar || form.name_ar.length < 2) errs.name_ar = t("name_ar_required");
    if (!form.auth_image_id) errs.auth_image_id = t("auth_image_required");
    if (!form.logo_id) errs.logo_id = t("logo_required");
    if (!form.city_id) errs.city_id = t("city_required");
    if (!form.district_id) errs.district_id = t("district_required");
    if (!form.auth_number) errs.auth_number = t("auth_number_required");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error(t("please_correct_errors"));
      return;
    }
    onSubmit(form);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute w-full h-full bg-black/50"
      onClick={onClose}></div>
        <form onSubmit={handleSubmit}        className="bg-white max-h-[90%] overflow-auto p-8 rounded-xl w-full max-w-xl shadow-lg space-y-6 relative"
        >
          <button
          type="button"
          className="absolute top-4 left-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
          <h2 className="text-xl font-bold mb-4">{isEdit ? t("edit") : t("add")}</h2>
          <div className="mb-3">
            <label className="block mb-1 font-medium">{t("name_ar")}</label>
            <input name="name_ar" value={form.name_ar} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
            {errors.name_ar && <div className="text-red-500 text-xs mt-1">{errors.name_ar}</div>}
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">{t("name_en")}</label>
            <input name="name_en" value={form.name_en} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">{t("auth_number")}</label>
            <input name="auth_number" value={form.auth_number} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
            {errors.auth_number && <div className="text-red-500 text-xs mt-1">{errors.auth_number}</div>}
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">{t("auth_image")}</label>
            <CustomFilePicker
              name="auth_image"
              imageId={form.auth_image_id}
              imageUrl={form.auth_image_url}
              onFileChange={onFileChange}
              locale={locale}
            />
            {errors.auth_image_id && <div className="text-red-500 text-xs mt-1">{errors.auth_image_id}</div>}
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">{t("logo")}</label>
            <CustomFilePicker
              name="logo"
              imageId={form.logo_id}
              imageUrl={form.logo_url}
              onFileChange={onFileChange}
              locale={locale}
            />
            {errors.logo_id && <div className="text-red-500 text-xs mt-1">{errors.logo_id}</div>}
          </div>
          <div className="mb-3">
  <label className="block mb-1 font-medium">{t("city")}</label>
  <Select
    name="city_id"
    options={[{ value: "", label: t("city") }, ...cities.map((city) => ({
      value: city.id,
      label: city.name,
    }))]}
    value={{
      value: form.city_id,
      label: cities.find((c) => c.id === form.city_id)?.name || t("city"),
    }}
    onChange={(selectedOption) => {
      const fakeEvent = {
        target: {
          name: "city_id",
          value: selectedOption?.value || "",
        },
      };
      handleChange(fakeEvent);
    }}
    className="react-select-container"
    classNamePrefix="react-select"
  />
  {errors.city_id && (
    <div className="text-red-500 text-xs mt-1">{errors.city_id}</div>
  )}
</div>
<div className="mb-3">
  <label className="block mb-1 font-medium">{t("district")}</label>
  <Select
    name="district_id"
    options={[{ value: "", label: t("district") }, ...districtOptions.map((district) => ({
      value: district.id,
      label: district.name,
    }))]}
    value={{
      value: form.district_id,
      label:
        districtOptions.find((d) => d.id === form.district_id)?.name ||
        t("district"),
    }}
    onChange={(selectedOption) => {
      const fakeEvent = {
        target: {
          name: "district_id",
          value: selectedOption?.value || "",
        },
      };
      handleChange(fakeEvent);
    }}
    className="react-select-container"
    classNamePrefix="react-select"
    isDisabled={!form.city_id}
  />
  {errors.district_id && (
    <div className="text-red-500 text-xs mt-1">{errors.district_id}</div>
  )}
</div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">{t("status")}</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg">
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">{t("cancel")}</button>
            <button type="submit" className="px-4 py-2 bg-[#0B7459] text-white rounded-lg">{isEdit ? t("update") : t("add")}</button>
          </div>
        </form>
      </div>
    )
  );
}
