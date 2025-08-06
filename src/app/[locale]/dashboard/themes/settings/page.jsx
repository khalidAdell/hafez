"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardPath from "../../../../../components/dashboard/DashboardPath";
import CustomFilePicker from "../../../../../components/CustomFilePicker";
import SaveCancelButtons from "../../../../../components/SaveCancelButtons";
import GlobalToast from "../../../../../components/GlobalToast";
import { usePathname } from "next/navigation";
import { fetchMetaSetting, updateMetaSetting, fetchCookiesSetting, updateCookiesSetting } from "../../../../../lib/api";
 

const SettingsThemePage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("seo");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaImage, setMetaImage] = useState(null);
  const [cookieAgreementEnabled, setCookieAgreementEnabled] = useState(false);
  const [cookieAgreementText, setCookieAgreementText] = useState("");
  const [error, setError] = useState(null);

  // Fetch meta settings
  const { data: metaSettings = {}, error: metaError } = useQuery({
    queryKey: ["metaSettings", locale],
    queryFn: () => fetchMetaSetting({}, locale).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  // Fetch cookie settings
  const { data: cookieSettings = {}, error: cookieError } = useQuery({
    queryKey: ["cookieSettings", locale],
    queryFn: () => fetchCookiesSetting({}, locale).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  // Handle meta settings error
  useEffect(() => {
    if (metaError) {
      const errorMessage = metaError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [metaError, t]);

  // Handle cookie settings error
  useEffect(() => {
    if (cookieError) {
      const errorMessage = cookieError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [cookieError, t]);

  // Initialize meta settings
  useEffect(() => {
    if (metaSettings) {
      setMetaTitle(metaSettings.meta_title || "");
      setMetaDescription(metaSettings.meta_description || "");
      setMetaKeywords(
        metaSettings.meta_keywords
          ? typeof metaSettings.meta_keywords === "string"
            ? JSON.parse(metaSettings.meta_keywords)
                .map((kw) => kw.value)
                .join(", ")
            : metaSettings.meta_keywords.join(", ")
          : ""
      );
      setMetaImage(metaSettings.meta_img ? `${metaSettings.meta_img}` : null);
    }
  }, [metaSettings]);

  // Initialize cookie settings
  useEffect(() => {
    if (cookieSettings) {
      setCookieAgreementEnabled(cookieSettings.cookies_status === "on");
      setCookieAgreementText(cookieSettings.cookies_text || "");
    }
  }, [cookieSettings]);

  // Update meta settings mutation
  const updateMetaMutation = useMutation({
    mutationFn: (settingsData) => updateMetaSetting(settingsData, locale),
    onSuccess: () => {
      queryClient.invalidateQueries(["metaSettings", locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // Update cookie settings mutation
  const updateCookieMutation = useMutation({
    mutationFn: (settingsData) => updateCookiesSetting(settingsData, locale),
    onSuccess: () => {
      queryClient.invalidateQueries(["cookieSettings", locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // Handle file change for meta image
  const handleFileChange = (name, file, imageId) => {
    if (name === "meta_image") {
      setMetaImage(imageId);
    }
  };

  // Handle save SEO settings
  const handleSaveSEO = () => {
    const formData = new FormData();
    formData.append("meta_title", metaTitle);
    formData.append("meta_description", metaDescription);
    formData.append(
      "meta_keywords",
      JSON.stringify(
        metaKeywords
          .split(",")
          .map((kw) => ({ value: kw.trim() }))
          .filter((kw) => kw.value)
      )
    );
    formData.append("meta_img", metaImage);
    updateMetaMutation.mutate(formData);
  };

  // Handle cancel SEO settings
  const handleCancelSEO = () => {
    setMetaTitle(metaSettings?.meta_title || "");
    setMetaDescription(metaSettings?.meta_description || "");
    setMetaKeywords(
      metaSettings?.meta_keywords
        ? typeof metaSettings.meta_keywords === "string"
          ? JSON.parse(metaSettings.meta_keywords)
              .map((kw) => kw.value)
              .join(", ")
          : metaSettings.meta_keywords.join(", ")
        : ""
    );
    setMetaImage(metaSettings?.meta_img ? `${metaSettings.meta_img}` : null);
  };

  // Handle save cookie settings
  const handleSaveCookie = () => {
    const formData = new FormData();
    formData.append("cookies_status", cookieAgreementEnabled ? "on" : "off");
    formData.append("cookies_text", cookieAgreementText);
    updateCookieMutation.mutate(formData);
  };

  // Handle cancel cookie settings
  const handleCancelCookie = () => {
    setCookieAgreementEnabled(cookieSettings?.cookies_status === "on");
    setCookieAgreementText(cookieSettings?.cookies_text || "");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GlobalToast />
      <DashboardPath
        pageTitle={t("themeSettings")}
        backUrl={`/${locale}/dashboard`}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="p-4">
        {/* Tabs */}
        <nav className="mb-6">
          <div className="flex border-b border-gray-300">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "seo"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#096a4d]"
              }`}
              onClick={() => setActiveTab("seo")}
            >
              {t("seoSettings")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "cookie"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#096a4d]"
              }`}
              onClick={() => setActiveTab("cookie")}
            >
              {t("cookieConsent")}
            </button>
          </div>
        </nav>

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6 space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">{t("metaTitle")}</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={t("enterMetaTitle")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">{t("metaDescription")}</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder={t("enterMetaDescription")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">{t("metaKeywords")}</label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder={t("enterKeywords")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">{t("metaImage")}</label>
              <CustomFilePicker
                name="meta_image"
                onFileChange={handleFileChange}
                locale={locale}
                imageId={metaImage}
              />
            </div>
            <SaveCancelButtons onSave={handleSaveSEO} onCancel={handleCancelSEO} />
          </div>
        )}

        {/* Cookie Agreement Tab */}
        {activeTab === "cookie" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={cookieAgreementEnabled}
                onChange={() => setCookieAgreementEnabled(!cookieAgreementEnabled)}
                id="cookieEnabled"
                className="w-5 h-5 text-[#0B7459] border-gray-300 rounded focus:ring-[#0B7459]"
              />
              <label htmlFor="cookieEnabled" className="font-medium text-gray-700">
                {t("cookieEnableText")}
              </label>
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">{t("cookieText")}</label>
              <textarea
                rows={6}
                disabled={!cookieAgreementEnabled}
                value={cookieAgreementText}
                onChange={(e) => setCookieAgreementText(e.target.value)}
                placeholder={t("enterCookieText")}
                className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${
                  cookieAgreementEnabled ? "focus:ring-[#0B7459]" : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>
            <SaveCancelButtons onSave={handleSaveCookie} onCancel={handleCancelCookie} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsThemePage;