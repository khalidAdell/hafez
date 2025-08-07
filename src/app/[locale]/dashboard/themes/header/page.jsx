"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardPath from "../../../../../components/dashboard/DashboardPath";
import CustomFilePicker from "../../../../../components/CustomFilePicker";
import SaveCancelButtons from "../../../../../components/SaveCancelButtons";
import GlobalToast from "../../../../../components/GlobalToast";
import { FiImage } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { fetchHeaderSettings, fetchSlidersSettings, updateHeaderSettings, updateSlidersSettings } from "../../../../../lib/api";

const HeaderPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("header");
  const [headerLogo, setHeaderLogo] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerLink, setBannerLink] = useState("");
  const [sliders, setSliders] = useState([{ id: 1, img: null, title: "", content: "" }]);
  const [error, setError] = useState(null);

  const { data: settings = [], error: settingsError } = useQuery({
    queryKey: ["headerSettings", locale],
    queryFn: () => fetchHeaderSettings({},locale).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  const { data: slidersData = [], error: slidersError } = useQuery({
    queryKey: ["slidersSettings", locale],
    queryFn: () => fetchSlidersSettings({},locale).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (settingsError ) {
      const errorMessage = settingsError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [settingsError, t]);
  
  useEffect(() => {
    if (slidersError ) {
      const errorMessage = slidersError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [slidersError, t]);

  useEffect(() => {
    if (settings) {
      setHeaderLogo(settings.header_logo ? `${settings.header_logo}` : null);
      setBannerImage(settings.header_baner ? `${settings.header_baner}` : null);
      setBannerLink(settings.baner_link || "");
    }
  }, [settings]);

  useEffect(() => {
    if (slidersData?.slider) {
      setSliders(
        slidersData.slider.map((s, index) => ({
          id: index + 1,
          img: s.img ? `${s.img}` : null,
          title: s.title || "",
          content: s.content || "",
        }))
      );
    }

  }, [slidersData]);
  
  

  const updateSettingsMutation = useMutation({
    mutationFn: (settingsData) => updateHeaderSettings(settingsData, locale),
    onSuccess: () => {
      queryClient.invalidateQueries(["headerSettings", locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateSlidersMutation = useMutation({
    mutationFn: (slidersData) => updateSlidersSettings(slidersData, locale),
    onSuccess: () => {
      queryClient.invalidateQueries(["slidersSettings", locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const handleFileChange = (name, file, imageId, imageUrl) => { 
    if (name === "header_logo") {
      setHeaderLogo(imageId);
    } else if (name === "header_baner") {
      setBannerImage(imageId);
    } else if (name.startsWith("slider_img_")) {
      const sliderId = name.split("_")[2];
      setSliders((prev) =>
        prev.map((slider) => (slider.id === parseInt(sliderId) ? { ...slider, img: imageId } : slider))
      );
    }
  };

  const handleSaveHeader = () => {
    const formData = new FormData();
    formData.append("header_logo", headerLogo);
    formData.append("header_baner", bannerImage);
    formData.append("baner_link", bannerLink);
    updateSettingsMutation.mutate(formData);
  };
  const handleSaveSliders = () => {
    const formData = new FormData();
  
    sliders.forEach((slider, index) => {
      formData.append(`slider[${index}][img]`, slider.img);
      formData.append(`slider[${index}][title]`, slider.title);
      formData.append(`slider[${index}][content]`, slider.content);
    });
  
    updateSlidersMutation.mutate(formData);
  };
  
  const handleCancelHeader = () => {
    setHeaderLogo(settings?.header_logo ? `${settings.header_logo}` : null);
    setBannerImage(settings?.header_baner ? `${settings.header_baner}` : null);
    setBannerLink(settings?.baner_link || "");
  };
  

  const handleCancelSliders = () => {
    setSliders(slidersData.slider);
  };

  const addSlider = () => {
    setSliders([...sliders, { id: Date.now(), img: null, title: "", content: "" }]);
  };

  const updateSlider = (id, field, value) => {
    setSliders((prev) =>
      prev.map((slider) => (slider.id === id ? { ...slider, [field]: value } : slider))
    );
  };

  const deleteSlider = (id) => {
    setSliders(sliders.filter((slider) => slider.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* <GlobalToast /> */}
      <DashboardPath pageTitle={t("header")} backUrl={`/${locale}/dashboard`} />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="p-4">
        {/* Tabs */}
        <nav className="mb-6">
          <div className="flex border-b border-gray-300">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "header"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#096a4d]"
              }`}
              onClick={() => setActiveTab("header")}
            >
              {t("header")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "slider"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#096a4d]"
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
              <div>

              <h2>{t("header_logo")}</h2>
              <CustomFilePicker
                name="header_logo"
                onFileChange={handleFileChange}
                locale={locale}
                imageId={headerLogo?.id || headerLogo}
              />
              </div>

              <div>

              <h2>{t("banner_top")}</h2>
              <CustomFilePicker
                name="banner_top"
                onFileChange={handleFileChange}
                locale={locale}
                imageId={bannerImage?.id || bannerImage}
              />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("link_banner")}</label>
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
                    <CustomFilePicker
                      name={`slider_img_${slider.id}`}
                      onFileChange={handleFileChange}
                      locale={locale}
                      imageId={slider.img?.id || slider.img}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("title")}</label>
                      <input
                        type="text"
                        value={slider.title}
                        onChange={(e) => updateSlider(slider.id, "title", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("content")}</label>
                      <textarea
                        value={slider.content}
                        onChange={(e) => updateSlider(slider.id, "content", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                        rows="4"
                      />
                    </div>
                  </div>
                  {sliders.length > 1 && (
                    <button
                      onClick={() => deleteSlider(slider.id)}
                      className="mt-4 text-red-600 hover:text-red-800"
                    >
                      {t("delete_slider")}
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addSlider}
                className="mt-4 bg-[#0B7459] text-white px-4 py-2 rounded-lg hover:bg-[#096a4d] transition-colors"
              >
                {t("add_slider")}
              </button>
              <SaveCancelButtons onSave={handleSaveSliders} onCancel={handleCancelSliders} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderPage;