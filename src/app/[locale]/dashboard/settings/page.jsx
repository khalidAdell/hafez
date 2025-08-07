"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardPath from "../../../../components/dashboard/DashboardPath";
import CustomFilePicker from "../../../../components/CustomFilePicker";
import SaveCancelButtons from "../../../../components/SaveCancelButtons";
import GlobalToast from "../../../../components/GlobalToast";
import { usePathname } from "next/navigation";
import { FiGlobe, FiClock, FiMessageSquare } from "react-icons/fi";
import { MdLanguage, MdPowerSettingsNew, MdSettings } from "react-icons/md";
import { BsToggleOn, BsToggleOff } from "react-icons/bs";
import { fetchGeneralSetting, updateGeneralSetting } from "../../../../lib/api";


const SettingsPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [timezone, setTimezone] = useState("Asia/Riyadh");
  const [language, setLanguage] = useState("ar");
  const [siteStatus, setSiteStatus] = useState(true);
  const [siteMessage, setSiteMessage] = useState("");
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [mobileIcon, setMobileIcon] = useState(null);
  const [systemName, setSystemName] = useState("");
  const [error, setError] = useState(null);

  // Fetch general settings
  const { data: generalSettings = {}, error: generalError } = useQuery({
    queryKey: ["generalSettings", locale],
    queryFn: () => fetchGeneralSetting({}, locale).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  // Handle general settings error
  useEffect(() => {
    if (generalError) {
      const errorMessage = generalError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [generalError, t]);

  // Initialize general settings
  useEffect(() => {
    if (generalSettings) {
      setSystemName(generalSettings.site_name || "");
      setTimezone(generalSettings.site_timezone || "Asia/Riyadh");
      setLanguage(generalSettings.site_default_lang || "ar");
      setSiteStatus(generalSettings.site_status === "1");
      setSiteMessage(generalSettings.site_close_message || "");
      setLogo(generalSettings.logo ? `${generalSettings.logo}` : null);
      setFavicon(generalSettings.favicon ? `${generalSettings.favicon}` : null);
      setMobileIcon(generalSettings.appleicon ? `${generalSettings.appleicon}` : null);
    }
  }, [generalSettings]);

  // Update general settings mutation
  const updateGeneralMutation = useMutation({
    mutationFn: (settingsData) => updateGeneralSetting(settingsData, locale),
    onSuccess: () => {
      queryClient.invalidateQueries(["generalSettings", locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // Handle file change for images
  const handleFileChange = (name, file, imageId) => {
    if (name === "logo") {
      setLogo(imageId);
    } else if (name === "favicon") {
      setFavicon(imageId);
    } else if (name === "mobile_icon") {
      setMobileIcon(imageId);
    }
  };

  // Handle save general settings
  const handleSave = () => {
    const formData = new FormData();
    formData.append("site_name", systemName);
    formData.append("site_timezone", timezone);
    formData.append("site_default_lang", language);
    formData.append("site_status", siteStatus ? "1" : "0");
    formData.append("site_close_message", siteMessage);
    formData.append("logo", logo);
    formData.append("favicon", favicon);
    formData.append("appleicon", mobileIcon);
    updateGeneralMutation.mutate(formData);
  };

  // Handle cancel general settings
  const handleCancel = () => {
    setSystemName(generalSettings?.site_name || "");
    setTimezone(generalSettings?.site_timezone || "Asia/Riyadh");
    setLanguage(generalSettings?.site_default_lang || "ar");
    setSiteStatus(generalSettings?.site_status === "1");
    setSiteMessage(generalSettings?.site_close_message || "");
    setLogo(generalSettings?.logo ? `${generalSettings.logo}` : null);
    setFavicon(generalSettings?.favicon ? `${generalSettings.favicon}` : null);
    setMobileIcon(generalSettings?.appleicon ? `${generalSettings.appleicon}` : null);
  };

  const InputField = ({ label, icon: Icon, children }) => (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className="w-4 h-4 text-[#0B7459]" />
        {label}
      </label>
      {children}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className="relative inline-flex items-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0B7459] focus:ring-offset-2 rounded-full"
    >
      {enabled ? (
        <BsToggleOn className="w-12 h-7 text-[#0B7459]" />
      ) : (
        <BsToggleOff className="w-12 h-7 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <GlobalToast /> */}
      <DashboardPath pageTitle={t("Settings")} backUrl={`/${locale}/dashboard`} />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-lg roundeds-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0B7459] to-[#0d8a68] px-8 py-6">
            <div className="flex items-center gap-3">
              <MdSettings className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">{t("SystemSettings")}</h2>
                <p className="text-green-100 mt-1">{t("SystemSettingsSubtitle")}</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InputField label={t("SystemName")} icon={FiGlobe}>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B7459] transition-all duration-200"
                  placeholder={t("EnterSystemName")}
                />
              </InputField>
              <InputField label={t("Timezone")} icon={FiClock}>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0B7459] transition-all duration-200"
                >
                  <option value="Asia/Riyadh">{t("Riyadh")}</option>
                  <option value="UTC">{t("UTC")}</option>
                  <option value="America/New_York">{t("NewYork")}</option>
                  <option value="Europe/London">{t("London")}</option>
                </select>
              </InputField>
              <InputField label={t("DefaultLanguage")} icon={MdLanguage}>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0B7459] transition-all duration-200"
                >
                  <option value="ar">{t("Arabic")}</option>
                  <option value="en">{t("English")}</option>
                </select>
              </InputField>
              <InputField label={t("SiteStatus")} icon={MdPowerSettingsNew}>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${siteStatus ? "bg-green-500" : "bg-red--ray-700"}`}
                    ></div>
                    <span className={`font-semibold ${siteStatus ? "text-green-700" : "text-red-700"}`}>
                      {siteStatus ? t("Active") : t("Inactive")}
                    </span>
                  </div>
                  <ToggleSwitch enabled={siteStatus} onChange={() => setSiteStatus(!siteStatus)} />
                </div>
              </InputField>
            </div>
            <div className="mt-8">
            <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <FiMessageSquare className="w-4 h-4 text-[#0B7459]" />
          {t("SiteCloseMessage")}
      </label>
                 <textarea
                  value={siteMessage}
                  onChange={(e) => setSiteMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B7459] resize-none transition-all duration-200"
                  rows="4"
                  placeholder={t("EnterCloseMessage")}
                />
    </div>
             </div>
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-800 mb-6">{t("ImageSettings")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4>{t("SiteLogo")}</h4>
                <CustomFilePicker
                  label={t("SiteLogo")}
                  name="logo"
                  onFileChange={handleFileChange}
                  locale={locale}
                  imageId={logo}
                />
                </div>
                <div>
                  <h4>{t("SiteFavicon")}</h4>
                <CustomFilePicker
                  label={t("SiteFavicon")}
                  name="favicon"
                  onFileChange={handleFileChange}
                  locale={locale}
                  imageId={favicon}
                />
                </div>
                <div>
                  <h4>{t("MobileIcon")}</h4>
                <CustomFilePicker
                  label={t("MobileIcon")}
                  name="mobile_icon"
                  onFileChange={handleFileChange}
                  locale={locale}
                  imageId={mobileIcon}
                />
                </div>
              </div>
            </div>
            <div className="mt-12 flex justify-end">
              <SaveCancelButtons onSave={handleSave} onCancel={handleCancel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;