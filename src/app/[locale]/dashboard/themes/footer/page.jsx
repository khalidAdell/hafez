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
import { fetchFooterSettings, updateFooterSettings, fetchContactSettings, updateContactSettings } from "../../../../../lib/api";

const FooterPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("footer");
  const [footerLogo, setFooterLogo] = useState(null);
  const [about, setAbout] = useState("");
  const [playApp, setPlayApp] = useState("");
  const [appleApp, setAppleApp] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
  });
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactMail, setContactMail] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [error, setError] = useState(null);

  // Fetch footer settings
  const { data: footerSettings = {}, error: footerError } = useQuery({
    queryKey: ["footerSettings", locale],
    queryFn: () => fetchFooterSettings({}, locale).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  // Fetch contact settings
  const { data: contactSettings = {}, error: contactError } = useQuery({
    queryKey: ["contactSettings", locale],
    queryFn: () => fetchContactSettings({}, locale).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  // Handle footer settings error
  useEffect(() => {
    if (footerError) {
      const errorMessage = footerError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [footerError, t]);

  // Handle contact settings error
  useEffect(() => {
    if (contactError) {
      const errorMessage = contactError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [contactError, t]);

  // Initialize footer settings
  useEffect(() => {
    if (footerSettings) {
      setFooterLogo(footerSettings.footer_logo ? `${footerSettings.footer_logo}` : null);
      setAbout(footerSettings.about || "");
      setPlayApp(footerSettings.play_app || "");
      setAppleApp(footerSettings.apple_app || "");
      setSocialLinks({
        facebook: footerSettings.social_links?.facebook || "",
        instagram: footerSettings.social_links?.instagram || "",
        twitter: footerSettings.social_links?.twitter || "",
        youtube: footerSettings.social_links?.youtube || "",
        linkedin: footerSettings.social_links?.linkedin || "",
      });
    }
  }, [footerSettings]);

  // Initialize contact settings
  useEffect(() => {
    if (contactSettings) {
      setContactPhone(contactSettings.contact_phone || "");
      setContactAddress(contactSettings.contact_address || "");
      setContactMail(contactSettings.contact_mail || "");
      setContactLocation(contactSettings.contact_location || "");
      setWorkingHours(contactSettings.working_hours || "");
    }
  }, [contactSettings]);

  // Update footer settings mutation
  const updateFooterMutation = useMutation({
    mutationFn: (settingsData) => updateFooterSettings(settingsData, locale),
    onSuccess: () => {
      queryClient.invalidateQueries(["footerSettings", locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // Update contact settings mutation
  const updateContactMutation = useMutation({
    mutationFn: (settingsData) => updateContactSettings(settingsData, locale),
    onSuccess: () => {
      queryClient.invalidateQueries(["contactSettings", locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // Handle file change for footer logo
  const handleFileChange = (name, file, imageId) => {
    if (name === "footer_logo") {
      setFooterLogo(imageId);
    }
  };

  // Handle save footer settings
  const handleSaveFooter = () => {
    const formData = new FormData();
    formData.append("footer_logo", footerLogo);
    formData.append("about", about);
    formData.append("play_app", playApp);
    formData.append("apple_app", appleApp);
    Object.keys(socialLinks).forEach((key) => {
      formData.append(`social_links[${key}]`, socialLinks[key]);
    });
    updateFooterMutation.mutate(formData);
  };

  // Handle save contact settings
  const handleSaveContact = () => {
    const formData = new FormData();
    formData.append("contact_phone", contactPhone);
    formData.append("contact_address", contactAddress);
    formData.append("contact_mail", contactMail);
    formData.append("contact_location", contactLocation);
    formData.append("working_hours", workingHours);
    updateContactMutation.mutate(formData);
  };

  // Handle cancel footer settings
  const handleCancelFooter = () => {
    setFooterLogo(footerSettings?.footer_logo ? `${footerSettings.footer_logo}` : null);
    setAbout(footerSettings?.about || "");
    setPlayApp(footerSettings?.play_app || "");
    setAppleApp(footerSettings?.apple_app || "");
    setSocialLinks({
      facebook: footerSettings?.social_links?.facebook || "",
      instagram: footerSettings?.social_links?.instagram || "",
      twitter: footerSettings?.social_links?.twitter || "",
      youtube: footerSettings?.social_links?.youtube || "",
      linkedin: footerSettings?.social_links?.linkedin || "",
    });
  };

  // Handle cancel contact settings
  const handleCancelContact = () => {
    setContactPhone(contactSettings?.contact_phone || "");
    setContactAddress(contactSettings?.contact_address || "");
    setContactMail(contactSettings?.contact_mail || "");
    setContactLocation(contactSettings?.contact_location || "");
    setWorkingHours(contactSettings?.working_hours || "");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* <GlobalToast /> */}
      <DashboardPath pageTitle={t("footer")} backUrl={`/${locale}/dashboard`} />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="p-4">
        {/* Tabs */}
        <nav className="mb-6">
          <div className="flex border-b border-gray-300">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "footer"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#096a4d]"
              }`}
              onClick={() => setActiveTab("footer")}
            >
              {t("footer")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "contact"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#096a4d]"
              }`}
              onClick={() => setActiveTab("contact")}
            >
              {t("contact")}
            </button>
          </div>
        </nav>

        {/* Footer Settings */}
        {activeTab === "footer" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2>{t("footer_logo")}</h2>
                <CustomFilePicker
                  name="footer_logo"
                  onFileChange={handleFileChange}
                  locale={locale}
                  imageId={footerLogo}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("about")}</label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("play_app")}</label>
                <input
                  type="text"
                  value={playApp}
                  onChange={(e) => setPlayApp(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  placeholder="https://play.google.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("apple_app")}</label>
                <input
                  type="text"
                  value={appleApp}
                  onChange={(e) => setAppleApp(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  placeholder="https://www.apple.com/app-store/..."
                />
              </div>
              <div className="md:col-span-2">
                <h2 className="text-lg font-medium mb-4">{t("social_links")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(socialLinks).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t(key)}</label>
                      <input
                        type="text"
                        value={socialLinks[key]}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                        placeholder={`https://${key}.com/...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SaveCancelButtons onSave={handleSaveFooter} onCancel={handleCancelFooter} />
          </div>
        )}

        {/* Contact Settings */}
        {activeTab === "contact" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("contact_phone")}</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  placeholder="0123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("contact_address")}</label>
                <input
                  type="text"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  placeholder={t("address_placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("contact_mail")}</label>
                <input
                  type="email"
                  value={contactMail}
                  onChange={(e) => setContactMail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  placeholder="example@domain.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("contact_location")}</label>
                <input
                  type="text"
                  value={contactLocation}
                  onChange={(e) => setContactLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("working_hours")}</label>
                <textarea
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  rows="4"
                  placeholder={t("working_hours_placeholder")}
                />
              </div>
            </div>
            <SaveCancelButtons onSave={handleSaveContact} onCancel={handleCancelContact} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterPage;