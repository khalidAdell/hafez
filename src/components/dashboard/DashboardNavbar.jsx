"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  FaChevronDown,
  FaUserCircle,
  FaEnvelope,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { getDashboardLinks } from "./dashboardLinks";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchProfile, currentDeviceLogout, otherDevicesLogout, allDevicesLogout } from "../../lib/api";
import { useUser } from "../../context/userContext";
import { toast } from "react-toastify";
import SaveCancelButtons from "../SaveCancelButtons";


export default function DashboardNavbar({ locale }) {
  const router = useRouter();
  const {user, logout} = useUser();
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutOption, setLogoutOption] = useState("current");
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Controlled input

  const t = useTranslations();
  const dashboardLinks = getDashboardLinks(t, locale);

  const switchLanguage = (newLocale) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${newLocale}`);
    router.push(newPath);
    setIsMobileMenuOpen(false);
    setOpenMenu(null);
    setUserMenuOpen(false);
    setLangDropdownOpen(false);
  };
  

  const { data: profileData = {}, error: profileError } = useQuery({
    queryKey: ["profile", locale],
    queryFn: () => fetchProfile({}, locale, user?.type).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  // Logout mutations
  const currentDeviceLogoutMutation = useMutation({
    mutationFn: () => currentDeviceLogout({}, locale, user?.type),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message, { autoClose: 3000 });
        router.push(`/${locale}/login`);
      } else {
        throw new Error(data.message || t("error"));
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const otherDevicesLogoutMutation = useMutation({
    mutationFn: () => otherDevicesLogout({}, locale, user?.type),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message, { autoClose: 3000 });
      } else {
        throw new Error(data.message || t("error"));
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const allDevicesLogoutMutation = useMutation({
    mutationFn: () => allDevicesLogout({}, locale, user?.type),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message, { autoClose: 3000 });
        router.push(`/${locale}/login`);
      } else {
        throw new Error(data.message || t("error"));
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const openLogoutModal = useCallback(() => {
    setLogoutOption("current");
    setIsLogoutModalOpen(true);
    setUserMenuOpen(false);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    if (!logoutOption) {
      toast.error(t("select_logout_option"), { autoClose: 3000 });
      return;
    }
    if (logoutOption === "current") {
      currentDeviceLogoutMutation.mutate(
        {
          onSuccess: () => {
            logout();
          },
        }
      );
    } else if (logoutOption === "other") {
      otherDevicesLogoutMutation.mutate();
    } else if (logoutOption === "all") {
      allDevicesLogoutMutation.mutate(
        {
          onSuccess: () => {
            logout();
          },
        }
      );
    }
    setIsLogoutModalOpen(false);
  }, [logoutOption, currentDeviceLogoutMutation, otherDevicesLogoutMutation, allDevicesLogoutMutation, t]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-dropdown-container")) setUserMenuOpen(false);
      if (!event.target.closest(".lang-dropdown-container")) setLangDropdownOpen(false);
      if (window.innerWidth >= 1024 && !event.target.closest(".desktop-menu-container")) setOpenMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const userMenuItems = [
    { label: t("profile"), href: `/${locale}/dashboard/profile`, icon: FaUserCircle },
    { label: t("logout"), onClick: openLogoutModal, icon: FaSignOutAlt },
  ];

  const handleMenuToggle = (idx) => setOpenMenu((prev) => (prev === idx ? null : idx));

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-l from-emerald-600 via-emerald-700 to-emerald-800 shadow-xl transition-all duration-500">
        <div className="max-w-8xl px-4 lg:px-6 mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href={`/${locale}/dashboard`} className="group flex items-center">
                <div className="relative overflow-hidden rounded-xl p-2 transition-all duration-300 bg-white/10 group-hover:bg-white/20 group-hover:scale-105 shadow-lg">
                  <Image
                    src="/logo-white.png"
                    width={48}
                    height={32}
                    alt="Hafez Logo"
                    className="h-7 w-10 lg:h-8 lg:w-12 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:flex flex-1 justify-center mx-4 desktop-menu-container">
              <ul className="flex items-center gap-2">
                {dashboardLinks.map((item, idx) => (
                 (item.type === user?.type || item.type === "all" || item.type.includes(user?.type)) && <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(idx)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    {item.children ? (
                      <div className="relative">
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-white/90 hover:text-white hover:bg-white/10 group text-sm transition-transform transform hover:scale-105"
                          aria-haspopup="true"
                          aria-expanded={openMenu === idx}
                        >
                          <span className="whitespace-nowrap">{item.label}</span>
                          <item.icon className="text-base" />
                          <FaChevronDown
                            className={`w-3 h-3 transition-transform duration-300 ${
                              openMenu === idx ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <div
                          className={`absolute top-full right-0 mt-1 w-52 z-50 transition-all duration-300 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm ${
                            openMenu === idx
                              ? "opacity-100 visible translate-y-0"
                              : "opacity-0 invisible -translate-y-2"
                          }`}
                          role="menu"
                        >
                          <div className="py-1">
                            {item.children.map((sub) => (
                              (!sub.type || sub.type == user?.type) &&
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className="flex items-center justify-between px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition text-right border-r-4 border-transparent hover:border-emerald-500 group text-sm"
                                onClick={() => setOpenMenu(null)}
                                role="menuitem"
                              >
                                <span className="font-medium">{sub.label}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition duration-200 scale-75 group-hover:scale-100" />
                                  <sub.icon className="text-emerald-600 opacity-0 group-hover:opacity-100 transition duration-200 w-4 h-4" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-white/90 hover:text-white hover:bg-white/10 text-sm transition transform hover:scale-105"
                      >
                        <span className="whitespace-nowrap">{item.label}</span>
                        <item.icon className="text-base" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Language Switcher desktop */}
            <div className="relative lang-dropdown-container ml-4 hidden lg:block">
              <button
                type="button"
                onClick={() => setLangDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 text-white bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-sm font-medium"
                aria-haspopup="true"
                aria-expanded={langDropdownOpen}
              >
                {locale === "ar" ? "العربية 🇸🇦" : "English 🇺🇸"}
                <FaChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    langDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  <button
                    onClick={() => switchLanguage("ar")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                      locale === "ar" ? "bg-green-50 text-emerald-700 font-semibold" : "text-gray-700"
                    }`}
                    type="button"
                  >
                    <span className="text-lg">🇸🇦</span>
                    <span>العربية</span>
                  </button>
                  <button
                    onClick={() => switchLanguage("en")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                      locale === "en" ? "bg-green-50 text-emerald-700 font-semibold" : "text-gray-700"
                    }`}
                    type="button"
                  >
                    <span className="text-lg">🇺🇸</span>
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>

            {/* User dropdown desktop */}
            <div className="hidden lg:block relative user-dropdown-container ml-4">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full"
                type="button"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <Image
                  src={profileData.profile_picture || "/about-1.jpg"}
                  width={40}
                  height={40}
                  alt="User Profile"
                  className="rounded-full border-2 border-white/30 size-11 bg-white"
                />
                <FaChevronDown
                  className={`w-3 h-3 transition-transform duration-300 text-white/90 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {userMenuOpen && (
                <div className="absolute top-full rtl:left-0 ltr:right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 backdrop-blur-sm z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray0-200 flex items-center gap-3 bg-emerald-50">
                    <Image
                      src={profileData.profile_picture || "/about-1.jpg"}
                      width={40}
                      height={40}
                      alt="User Profile"
                      className="size-10 rounded-full border-2 border-emerald-300"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{profileData.name || ""}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 truncate">
                        <FaEnvelope className="w-4 h-4" /> {profileData.email || ""}
                      </p>
                    </div>
                  </div>
                  <div>
                    {userMenuItems.map((item) => (
                      item.href ? (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center justify-between px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition text-right border-r-4 border-transparent hover:border-emerald-500 group text-sm"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span className="font-medium">{item.label}</span>
                          <item.icon className="text-emerald-600 opacity-0 group-hover:opacity-100 w-4 h-4 transition" />
                        </Link>
                      ) : (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition text-right border-r-4 border-transparent hover:border-emerald-500 group text-sm"
                        >
                          <span className="font-medium">{item.label}</span>
                          <item.icon className="text-emerald-600 opacity-0 group-hover:opacity-100 w-4 h-4 transition" />
                        </button>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden ml-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition"
                aria-label="Open mobile menu"
                type="button"
              >
                <FaBars className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-l from-emerald-500 via-emerald-600 to-emerald-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 bg-black/50 backdrop-blur-sm ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => {
          setIsMobileMenuOpen(false);
          setOpenMenu(null);
          setUserMenuOpen(false);
          setLangDropdownOpen(false);
        }}
      >
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-emerald-50">
            <div className="flex items-center gap-2 font-bold text-emerald-800 text-lg">
              <FaBars />
            </div>
            <button
              type="button"
              className="p-2 rounded hover:bg-emerald-200 transition"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <FaTimes className="text-gray-700 w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mobile */}
          <div
            className="user-dropdown-container p-4 border-b border-gray-200 bg-emerald-50 flex items-center gap-4 cursor-pointer"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <Image
              src={profileData.profile_picture || "/about-1.jpg"}
              width={40}
              height={40}
              alt="User Profile"
              className="size-10 rounded-full border-2 border-emerald-300 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate text-base">{profileData.name || ""}</p>
              <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                <FaEnvelope className="w-3 h-3" /> {profileData.email || ""}
              </p>
            </div>
            <FaChevronDown
              className={`w-5 h-5 text-emerald-700 transition-transform duration-300 ${
                userMenuOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* User dropdown menu mobile */}
          {userMenuOpen && (
            <div className="bg-white border-t border-b border-gray-300">
              {userMenuItems.map((item) => (
                item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              ))}
            </div>
          )}

          {/* Language Switcher Mobile */}
          <div className="border-t border-gray-300 py-3 px-4 bg-emerald-50">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => switchLanguage("ar")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                  locale === "ar" ? "bg-green-100 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">🇸🇦</span> العربية
              </button>
              <button
                type="button"
                onClick={() => switchLanguage("en")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                  locale === "en" ? "bg-green-100 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">🇺🇸</span> English
              </button>
            </div>
          </div>

          {/* Main Navigation Mobile */}
          <nav className="overflow-y-auto h-[calc(120vh-370px)] p-3 space-y-2">
            {dashboardLinks.map((item, idx) => (
                 (item.type === user?.type || item.type === "all" || item.type.includes(user?.type)) &&
              <div key={item.label} className="space-y-1 border-b border-gray-300 last:border-b-0 pb-2">
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-3 text-gray-700 rounded-lg hover:bg-emerald-50 transition"
                      onClick={() => handleMenuToggle(idx)}
                      aria-expanded={openMenu === idx}
                      aria-controls={`submenu-${idx}`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <item.icon className="text-emerald-700" />
                        <span>{item.label}</span>
                      </div>
                      <FaChevronDown
                        className={`w-4 h-4 text-emerald-700 transition-transform duration-300 ${
                          openMenu === idx ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openMenu === idx && (
                      <div id={`submenu-${idx}`} className="pl-8 space-y-1" role="menu">
                        {item.children.map((sub) => (
                              (!sub.type || sub.type == user?.type) &&
                          <Link
                            key={sub.label}
                            href={sub.href}
                            className="block p-2 rounded hover:bg-emerald-100 text-gray-600 hover:text-emerald-700 transition"
                            onClick={() => setIsMobileMenuOpen(false)}
                            role="menuitem"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="text-emerald-700" />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeLogoutModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
              <h3 className="text-xl font-semibold text-[#0B7459] mb-4">{t("logout")}</h3>
              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="logoutOption"
                    value="current"
                    checked={logoutOption === "current"}
                    onChange={(e) => setLogoutOption(e.target.value)}
                    className="text-[#0B7459] focus:ring-[#0B7459]"
                  />
                  <span className="text-gray-700">{t("logoutCurrentDevice")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="logoutOption"
                    value="other"
                    checked={logoutOption === "other"}
                    onChange={(e) => setLogoutOption(e.target.value)}
                    className="text-[#0B7459] focus:ring-[#0B7459]"
                  />
                  <span className="text-gray-700">{t("logoutOtherDevices")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="logoutOption"
                    value="all"
                    checked={logoutOption === "all"}
                    onChange={(e) => setLogoutOption(e.target.value)}
                    className="text-[#0B7459] focus:ring-[#0B7459]"
                  />
                  <span className="text-gray-700">{t("logoutAllDevices")}</span>
                </label>
              </div>
              <SaveCancelButtons onSave={handleLogout} onCancel={closeLogoutModal} saveLabel={t("logout")} />
            </div>
          </div>
        </>
      )}
    </>
  );
}