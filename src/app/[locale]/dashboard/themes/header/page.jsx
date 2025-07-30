"use client";

import React, { useState } from "react";
import DashboardPath from "../../../../../components/dashboard/DashboardPath";
import FileUploadArea from "../../../../../components/FileUploadArea";
import SaveCancelButtons from "../../../../../components/SaveCancelButtons";

import { FiImage } from "react-icons/fi";
import { useTranslations } from "next-intl";

const HeaderPage = () => {
  const [activeTab, setActiveTab] = useState("header");
  const [headerLogo, setHeaderLogo] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerLink, setBannerLink] = useState("");
  const [sliders, setSliders] = useState([{ id: 1, image: null, title: "", content: "" }]);
  const t = useTranslations();

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      setter(URL.createObjectURL(file));
    }
  };

  const handleSaveHeader = () => {
    console.log({ headerLogo, bannerImage, bannerLink });
  };

  const handleCancelHeader = () => {
    setHeaderLogo(null);
    setBannerImage(null);
    setBannerLink("");
  };

  const addSlider = () => {
    setSliders([...sliders, { id: Date.now(), image: null, title: "", content: "" }]);
  };

  const updateSlider = (id, field, value) => {
    setSliders(
      sliders.map((slider) => (slider.id === id ? { ...slider, [field]: value } : slider))
    );
  };

  const deleteSlider = (id) => {
    setSliders(sliders.filter((slider) => slider.id !== id));
  };

  const handleSaveSlider = () => {
    console.log(sliders);
  };

  const handleCancelSlider = () => {
    setSliders([{ id: 1, image: null, title: "", content: "" }]);
  };

  return (
    <div>
      <DashboardPath  pageTitle={t("header")} backUrl="/dashboard" addUrl="/dashboard/themes/header/add" />
      <div className="p-4">
        {/* Tabs */}
        <nav className="mb-6">
          <div className="flex border-b border-gray-300">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "header"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600  hover:text-[#096a4d]"
              }`}
              onClick={() => setActiveTab("header")}
            >
              {t("header")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "slider"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600  hover:text-[#096a4d]"
              }`}
              onClick={() => setActiveTab("slider")}
            >
              {t("slider")}
            </button>
          </div>
        </nav>

        {/* Header Settings */}
        {activeTab === "header" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadArea
                label={t("header-logo")}
                icon={FiImage}
                file={headerLogo}
                onChange={(e) => handleFileChange(e, setHeaderLogo)}
                previewSize="w-32 h-32"
              />

              <FileUploadArea
                label={t("banner-top")}
                icon={FiImage}
                file={bannerImage}
                onChange={(e) => handleFileChange(e, setBannerImage)}
                previewSize="w-32 h-32"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("link-banner")}</label>
                <input
                  type="text"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  placeholder="https://xxxxxxxxxxxxxx"
                />
              </div>
            </div>

            <SaveCancelButtons onSave={handleSaveHeader} onCancel={handleCancelHeader} />
          </div>
        )}

        {/* Slider Settings */}
        {activeTab === "slider" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6">
            <div className="space-y-6">
              {sliders.map((slider) => (
                <div key={slider.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUploadArea
                      label={t("slider-image")}
                      icon={FiImage}
                      file={slider.image}
                      onChange={(e) => handleFileChange(e, (url) => updateSlider(slider.id, "image", url))}
                      previewSize="w-32 h-32"
                    />

                      <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("content")}</label>
                      <textarea
                        value={slider.content}
                        onChange={(e) => updateSlider(slider.id, "content", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                        rows="4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("address")}</label>
                      <input
                        type="text"
                        value={slider.title}
                        onChange={(e) => updateSlider(slider.id, "title", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                      />
                    </div>

                  
                  </div>

                  {sliders.length > 1 && (
                    <button
                      onClick={() => deleteSlider(slider.id)}
                      className="mt-4 text-red-600 hover:text-red-800"
                    >
                      {t("delete-slider")}
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addSlider}
                className="mt-4 bg-[#0B7459] text-white px-4 py-2 rounded-lg hover:bg-[#096a4d] transition-colors"
              >
                {t("add-slider")}
              </button>

              <SaveCancelButtons onSave={handleSaveSlider} onCancel={handleCancelSlider} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderPage;
