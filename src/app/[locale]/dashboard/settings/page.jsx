"use client"

import { useState } from "react"
import { FiImage, FiSmartphone, FiGlobe, FiClock, FiMessageSquare } from "react-icons/fi"
import { MdLanguage, MdPowerSettingsNew, MdSettings, MdSave } from "react-icons/md"
import { HiOutlinePhotograph } from "react-icons/hi"
import { BsToggleOn, BsToggleOff } from "react-icons/bs"
import FileUploadArea from "../../../../components/FileUploadArea"
import { useTranslations } from "next-intl"

const DashboardHeader = ({ pageTitle }) => (
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
  </div>
)

const SettingsPage = () => {
  const t = useTranslations()
  const [timezone, setTimezone] = useState("Asia/Riyadh")
  const [language, setLanguage] = useState("ar")
  const [siteStatus, setSiteStatus] = useState(true)
  const [siteMessage, setSiteMessage] = useState("")
  const [logo, setLogo] = useState(null)
  const [favicon, setFavicon] = useState(null)
  const [mobileIcon, setMobileIcon] = useState(null)
  const [systemName, setSystemName] = useState("")

  const handleSave = () => {
    console.log({
      timezone,
      language,
      siteStatus,
      siteMessage,
      logo,
      favicon,
      mobileIcon,
      systemName,
    })
  }

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0]
    if (file) {
      setter(URL.createObjectURL(file))
    }
  }

  const InputField = ({ label, icon: Icon, children }) => (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className="w-4 h-4 text-[#0B7459]" />
        {label}
      </label>
      {children}
    </div>
  )

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
  )

  return (
    <div className="min-h-screen bg-gray-50" >
      <DashboardHeader pageTitle={t("Settings")} />

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
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
                    <div className={`w-3 h-3 rounded-full ${siteStatus ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className={`font-semibold ${siteStatus ? "text-green-700" : "text-red-700"}`}>
                      {siteStatus ? t("Active") : t("Inactive")}
                    </span>
                  </div>
                  <ToggleSwitch enabled={siteStatus} onChange={() => setSiteStatus(!siteStatus)} />
                </div>
              </InputField>
            </div>

            <div className="mt-8">
              <InputField label={t("SiteCloseMessage")} icon={FiMessageSquare}>
                <textarea
                  value={siteMessage}
                  onChange={(e) => setSiteMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B7459] resize-none transition-all duration-200"
                  rows="4"
                  placeholder={t("EnterCloseMessage")}
                />
              </InputField>
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <HiOutlinePhotograph className="w-5 h-5 text-[#0B7459]" />
                {t("ImageSettings")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FileUploadArea
                  label={t("SiteLogo")}
                  icon={FiImage}
                  file={logo}
                  onChange={e => handleFileChange(e, setLogo)}
                  previewSize="w-32 h-32"
                />

                <FileUploadArea
                  label={t("SiteFavicon")}
                  icon={FiGlobe}
                  file={favicon}
                  onChange={e => handleFileChange(e, setFavicon)}
                  previewSize="w-16 h-16"
                />

                <FileUploadArea
                  label={t("MobileIcon")}
                  icon={FiSmartphone}
                  file={mobileIcon}
                  onChange={e => handleFileChange(e, setMobileIcon)}
                  previewSize="w-16 h-16"
                />
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-[#0B7459] to-[#0d8a68] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#096a4d] hover:to-[#0b7459] transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <MdSave className="w-5 h-5" />
                {t("SaveChanges")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
