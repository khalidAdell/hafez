"use client";

import React, { useState } from "react";
import DashboardPath from "../../../../../components/dashboard/DashboardPath";
import FileUploadArea from "../../../../../components/FileUploadArea";
import SaveCancelButtons from "../../../../../components/SaveCancelButtons";
import { FiImage } from "react-icons/fi";
import { useTranslations } from "next-intl";

const SettingsThemePage = () => {
  const [activeTab, setActiveTab] = useState("seo");
  const t = useTranslations();

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaImage, setMetaImage] = useState(null);

  const [cookieAgreementEnabled, setCookieAgreementEnabled] = useState(false);
  const [cookieAgreementText, setCookieAgreementText] = useState("");

  const [headScript, setHeadScript] = useState("");
  const [bodyScript, setBodyScript] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMetaImage(URL.createObjectURL(file));
    }
  };

  const handleSaveSEO = () => {
    console.log({
      metaTitle,
      metaDescription,
      metaKeywords,
      metaImage,
    });
  };

  const handleCancelSEO = () => {
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setMetaImage(null);
  };

  const handleSaveCookie = () => {
    console.log({ cookieAgreementEnabled, cookieAgreementText });
  };

  const handleCancelCookie = () => {
    setCookieAgreementEnabled(false);
    setCookieAgreementText("");
  };

  const handleSaveScripts = () => {
    console.log({ headScript, bodyScript });
  };

  const handleCancelScripts = () => {
    setHeadScript("");
    setBodyScript("");
  };

  return (
    <div>
      <DashboardPath
        pageTitle={t("themeSettings")}
        backUrl="/dashboard"
        addUrl="/dashboard/themes/settings/add"
      />

      <div className="p-4">
        {/* Tabs */}
        <nav className="mb-6">
          <div className="flex border-b border-gray-300">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "seo"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#0B7459]"
              }`}
              onClick={() => setActiveTab("seo")}
            >
              {t("seoSettings")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "cookie"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#0B7459]"
              }`}
              onClick={() => setActiveTab("cookie")}
            >
              {t("cookieConsent")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "scripts"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#0B7459]"
              }`}
              onClick={() => setActiveTab("scripts")}
            >
              {t("additionalScripts")}
            </button>
          </div>
        </nav>

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6 space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {t("metaTitle")}
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={t("enterMetaTitle")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {t("metaDescription")}
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder={t("enterMetaDescription")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {t("metaKeywords")}
              </label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder={t("enterKeywords")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <FileUploadArea
              label={t("metaImage")}
              icon={FiImage}
              file={metaImage}
              onChange={handleFileChange}
              previewSize="w-32 h-32"
            />

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
                onChange={() =>
                  setCookieAgreementEnabled(!cookieAgreementEnabled)
                }
                id="cookieEnabled"
                className="w-5 h-5 text-[#0B7459] border-gray-300 rounded focus:ring-[#0B7459]"
              />
              <label htmlFor="cookieEnabled" className="font-medium text-gray-700">
                {t("cookieEnableText")}
              </label>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {t("cookieText")}
              </label>
              <textarea
                rows={6}
                disabled={!cookieAgreementEnabled}
                value={cookieAgreementText}
                onChange={(e) => setCookieAgreementText(e.target.value)}
                placeholder={t("enterCookieText")}
                className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${
                  cookieAgreementEnabled
                    ? "focus:ring-[#0B7459]"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            <SaveCancelButtons onSave={handleSaveCookie} onCancel={handleCancelCookie} />
          </div>
        )}

        {/* Additional Scripts Tab */}
        {activeTab === "scripts" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6 space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {t("headScript")}
              </label>
              <textarea
                rows={6}
                value={headScript}
                onChange={(e) => setHeadScript(e.target.value)}
                placeholder={t("enterScript")}
                className="w-full p-2 bordear border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {t("bodyScript")}
              </label>
              <textarea
                rows={6}
                value={bodyScript}
                onChange={(e) => setBodyScript(e.target.value)}
                placeholder={t("enterScript")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <SaveCancelButtons onSave={handleSaveScripts} onCancel={handleCancelScripts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsThemePage;
