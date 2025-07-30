"use client";

import React, { useState } from "react";
import DashboardPath from "../../../../../components/dashboard/DashboardPath";
import FileUploadArea from "../../../../../components/FileUploadArea";
import SaveCancelButtons from "../../../../../components/SaveCancelButtons";
import { FiImage, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import { useTranslations } from "next-intl";

const FooterPage = () => {
  const [activeTab, setActiveTab] = useState("about");
  const t = useTranslations();

  const [aboutText, setAboutText] = useState("");
  const [footerLogo, setFooterLogo] = useState(null);
  const [playStoreLink, setPlayStoreLink] = useState("");
  const [appStoreLink, setAppStoreLink] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [workingHours, setWorkingHours] = useState("");

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      setter(URL.createObjectURL(file));
    }
  };

  const handleSaveAbout = () => {
    console.log({ aboutText, footerLogo, playStoreLink, appStoreLink });
  };

  const handleCancelAbout = () => {
    setAboutText("");
    setFooterLogo(null);
    setPlayStoreLink("");
    setAppStoreLink("");
  };

  const handleSaveContact = () => {
    console.log({ phoneNumber, address, email, mapLink, workingHours });
  };

  const handleCancelContact = () => {
    setPhoneNumber("");
    setAddress("");
    setEmail("");
    setMapLink("");
    setWorkingHours("");
  };

  return (
    <div>
      <DashboardPath
        pageTitle={t("footer")}
        backUrl="/dashboard"
        addUrl="/dashboard/themes/footer/add"
      />

      <div className="p-4">
        {/* Tabs */}
        <nav className="mb-6">
          <div className="flex border-b border-gray-300">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "about"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#096a4d]"
              }`}
              onClick={() => setActiveTab("about")}
            >
              {t("tab_about")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "contact"
                  ? "border-b-2 border-[#0B7459] text-[#0B7459]"
                  : "text-gray-600 hover:text-[#096a4d]"
              }`}
              onClick={() => setActiveTab("contact")}
            >
              {t("tab_contact")}
            </button>
          </div>
        </nav>

        {/* About Us Tab */}
        {activeTab === "about" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6 space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                {t("about_text_label")}
              </label>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                placeholder={t("about_text_placeholder")}
              />
            </div>

            <FileUploadArea
              label={t("footer_logo")}
              icon={FiImage}
              file={footerLogo}
              onChange={(e) => handleFileChange(e, setFooterLogo)}
              previewSize="w-32 h-32"
            />

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                {t("playstore_link_label")}
              </label>
              <input
                type="text"
                value={playStoreLink}
                onChange={(e) => setPlayStoreLink(e.target.value)}
                placeholder={t("playstore_link_placeholder")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                {t("appstore_link_label")}
              </label>
              <input
                type="text"
                value={appStoreLink}
                onChange={(e) => setAppStoreLink(e.target.value)}
                placeholder={t("appstore_link_placeholder")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <SaveCancelButtons onSave={handleSaveAbout} onCancel={handleCancelAbout} />
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === "contact" && (
          <div className="bg-gray-50 shadow-sm rounded-lg p-6 space-y-6">
            <div>
              <label className=" mb-1 font-medium text-gray-700 flex items-center gap-2">
                <FiPhone />
                {t("phone_label")}
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t("phone_placeholder")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <div>
              <label className=" mb-1 font-medium text-gray-700 flex items-center gap-2">
                <FiMapPin />
                {t("address_label")}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("address_placeholder")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <div>
              <label className=" mb-1 font-medium text-gray-700 flex items-center gap-2">
                <FiMail />
                {t("email_label")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email_placeholder")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                {t("map_link_label")}
              </label>
              <input
                type="text"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                placeholder={t("map_link_placeholder")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                {t("working_hours_label")}
              </label>
              <textarea
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                rows={3}
                placeholder={t("working_hours_placeholder")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              />
            </div>

            <SaveCancelButtons onSave={handleSaveContact} onCancel={handleCancelContact} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterPage;
