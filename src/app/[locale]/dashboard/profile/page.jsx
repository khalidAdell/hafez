"use client";

import React, { useState, useCallback,useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardPath from "../../../../components/dashboard/DashboardPath";
import CustomFilePicker from "../../../../components/CustomFilePicker";
import SaveCancelButtons from "../../../../components/SaveCancelButtons";
import GlobalToast from "../../../../components/GlobalToast";
import { fetchProfile, updateProfile, updateProfilePassword, currentDeviceLogout, otherDevicesLogout, allDevicesLogout } from "../../../../lib/api";
import { FaEye } from "react-icons/fa";
import { useUser } from "../../../../context/userContext";

const ProfilePage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [logoutOption, setLogoutOption] = useState("current");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    user_img: null,
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState(null);
  const { user, logout } = useUser();
  const type = user?.type;
  // Fetch profile data
  const { data: profileData = {}, error: profileError } = useQuery({
    queryKey: ["profile", locale],
    queryFn: () => fetchProfile({}, locale,type).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  // Handle profile error
  useEffect(() => {
    if (profileError) {
      const errorMessage = profileError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [profileError, t]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => updateProfile(profileData, locale,type),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(["profile", locale]);
        toast.success(data.message, { autoClose: 3000 });
        closeModal();
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

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (passwordData) => updateProfilePassword(passwordData, locale,type),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message, { autoClose: 3000 });
        setPasswordData({ current_password: "", password: "", password_confirmation: "" });
        setIsPasswordModalOpen(false);
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

  // Logout mutations
  const currentDeviceLogoutMutation = useMutation({
    mutationFn: () => currentDeviceLogout({}, locale,type),
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
    mutationFn: () => otherDevicesLogout({}, locale,type),
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
    mutationFn: () => allDevicesLogout({}, locale,type),
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

  const openModal = useCallback(() => {
    setFormData({
      name: profileData.name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      user_img: profileData.user_img ? `${profileData.user_img}` : null,
    });
    setIsModalOpen(true);
  }, [profileData]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openPasswordModal = useCallback(() => {
    setPasswordData({ current_password: "", password: "", password_confirmation: "" });
    setIsPasswordModalOpen(true);
  }, []);

  const closePasswordModal = useCallback(() => {
    setIsPasswordModalOpen(false);
  }, []);

  const openLogoutModal = useCallback(() => {
    setLogoutOption("current");
    setIsLogoutModalOpen(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(false);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((name, file, imageId) => {
    if (name === "user_img") {
      setFormData((prev) => ({ ...prev, user_img: imageId }));
    }
  }, []);

  const handleSaveProfile = useCallback(() => {
    if (!formData.name || !formData.email) {
      toast.error(t("required_fields_missing"), { autoClose: 3000 });
      return;
    }
    const profileFormData = new FormData();
    profileFormData.append("_method", "PUT");
    profileFormData.append("name", formData.name);
    profileFormData.append("email", formData.email);
    profileFormData.append("phone", formData.phone || "");
    profileFormData.append("user_img", formData.user_img || "");
    updateProfileMutation.mutate(profileFormData);
  }, [formData, updateProfileMutation, t]);

  const handleSavePassword = useCallback(() => {
    if (!passwordData.current_password || !passwordData.password || !passwordData.password_confirmation) {
      toast.error(t("required_fields_missing"), { autoClose: 3000 });
      return;
    }
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error(t("password_mismatch"), { autoClose: 3000 });
      return;
    }
    const passwordFormData = new FormData();
    passwordFormData.append("current_password", passwordData.current_password);
    passwordFormData.append("password", passwordData.password);
    passwordFormData.append("password_confirmation", passwordData.password_confirmation);
    updatePasswordMutation.mutate(passwordFormData);
  }, [passwordData, updatePasswordMutation, t]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      {/* <GlobalToast /> */}
      <DashboardPath pageTitle={t("profile")} backUrl={`/${locale}/dashboard`} />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center border-b pb-8">
          <Image
            src={profileData.profile_picture || "/about-1.jpg"}
            alt={t("avatarAlt")}
            width={120}
            height={120}
            className="rounded-full border-4 border-[#0B7459] size-32"
          />
          <h1 className="mt-6 text-2xl font-semibold text-gray-900">{profileData.name || ""}</h1>
          <p className="text-gray-700 mt-1">{profileData.email || ""}</p>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0B7459]">{t("accountInfo")}</h2>
            <ul className="mt-2 text-gray-800 space-y-1">
              <li>
                <strong>{t("username")}:</strong> {profileData.name || ""}
              </li>
              <li>
                <strong>{t("email")}:</strong> {profileData.email || ""}
              </li>
              <li>
                <strong>{t("phone")}:</strong> {profileData.phone || ""}
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={openModal}
              className="bg-[#0B7459] hover:bg-[#095d47] transition-colors duration-300 text-white py-2 px-6 rounded-xl font-medium"
            >
              {t("editAccount")}
            </button>
            <button
              onClick={openPasswordModal}
              className="bg-[#0B7459] hover:bg-[#095d47] transition-colors duration-300 text-white py-2 px-6 rounded-xl font-medium"
            >
              {t("changePassword")}
            </button>
            <button
              onClick={openLogoutModal}
              className="bg-gray-300 hover:bg-gray-400 transition-colors duration-300 text-gray-800 py-2 px-6 rounded-xl font-medium"
            >
              {t("logout")}
            </button>
          </div>
        </div>

        {/* Profile Edit Modal */}
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={closeModal}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
                <h3 className="text-xl font-semibold text-[#0B7459] mb-4">{t("editAccount")}</h3>
                <div className="mb-4">
                  <CustomFilePicker
                    name="user_img"
                    onFileChange={handleImageChange}
                    locale={locale}
                    imageId={formData.user_img}
                  />
                </div>
                <label className="block mb-3">
                  <span className="text-gray-700">{t("username")}</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                </label>
                <label className="block mb-3">
                  <span className="text-gray-700">{t("email")}</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                </label>
                <label className="block mb-4">
                  <span className="text-gray-700">{t("phone")}</span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                </label>
                <SaveCancelButtons onSave={handleSaveProfile} onCancel={closeModal} />
              </div>
            </div>
          </>
        )}

        {/* Password Change Modal */}
        {isPasswordModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={closePasswordModal}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
                <h3 className="text-xl font-semibold text-[#0B7459] mb-4">{t("changePassword")}</h3>
                <label className="block mb-3">
                  <span className="text-gray-700">{t("currentPassword")}</span>
                  <div className="relative">
                  <input
                    type={`${passwordVisible ? "text" : "password"}`}
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                  <FaEye onClick={() => setPasswordVisible(!passwordVisible)} className="absolute ltr:right-2 rtl:left-2 top-1/2 transform -translate-y-1/2 cursor-pointer" />
                  </div>
                </label>
                <label className="block mb-3">
                  <span className="text-gray-700">{t("newPassword")}</span>
                  <input
                    type={`${passwordVisible ? "text" : "password"}`}
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                </label>
                <label className="block mb-4">
                  <span className="text-gray-700">{t("confirmNewPassword")}</span>
                  <input
                    type={`${passwordVisible ? "text" : "password"}`}
                    name="password_confirmation"
                    value={passwordData.password_confirmation}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                </label>
                <SaveCancelButtons onSave={handleSavePassword} onCancel={closePasswordModal} />
              </div>
            </div>
          </>
        )}

        {/* Logout Modal */}
        {isLogoutModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
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
      </div>
    </div>
  );
};

export default ProfilePage;