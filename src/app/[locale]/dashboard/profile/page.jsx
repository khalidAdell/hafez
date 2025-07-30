"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const ProfilePage = () => {
  const t = useTranslations();
    const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";

  const [user, setUser] = useState({
    name: "Yosef Alshafiey",
    email: "yosef@example.com",
    imageSrc: "/about-1.jpg",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(user);

  const fileInputRef = useRef(null); 

  const openModal = () => {
    setFormData(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // معاينة الصورة مباشرة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageSrc: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSave = () => {
    setUser(formData);
    closeModal();
    alert("تم حفظ التعديلات بنجاح");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-8 relative">
        <div>
          <button
            onClick={() =>
              router.push(`/${locale}/dashboard/students/${row.id}`)
            }
            style={{
              backgroundColor: "#03A6A1",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            عرض التقرير
          </button>
        </div>
        <div className="flex flex-col items-center border-b pb-8">
          <Image
            src={user.imageSrc}
            alt={t("avatarAlt")}
            width={120}
            height={120}
            className="rounded-full border-4 border-[#0B7459] size-32"
          />
          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            {user.name}
          </h1>
          <p className="text-gray-700 mt-1">{user.email}</p>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0B7459]">
              {t("accountInfo")}
            </h2>
            <ul className="mt-2 text-gray-800 space-y-1">
              <li>
                <strong>{t("username")}:</strong> {user.name}
              </li>
              <li>
                <strong>{t("email")}:</strong> {user.email}
              </li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={openModal}
              className="bg-[#0B7459] hover:bg-[#095d47] transition-colors duration-300 text-white py-2 px-6 rounded-xl font-medium"
            >
              {t("editAccount")}
            </button>
            <button
              onClick={handleSave}
              className="bg-gray-300 hover:bg-gray-400 transition-colors duration-300 text-gray-800 py-2 px-6 rounded-xl font-medium"
            >
              {t("logout")}
            </button>
          </div>
        </div>

        {/* المودال */}
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 bg-opacity-50 backdrop-blur-sm z-40"
              onClick={closeModal}
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
                <h3 className="text-xl font-semibold text-[#0B7459] mb-4">
                  {t("editAccount")}
                </h3>

                {/* الصورة + زر القلم */}
                <div className="relative flex justify-center mb-4">
                  <Image
                    src={formData.imageSrc || "/about-1.jpg"}
                    alt={t("avatarAlt")}
                    width={100}
                    height={100}
                    className="rounded-full border-4 size-32 border-[#0B7459]"
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute bottom-0 rtl:right-[37%] lte:left-[37%] bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100 transition"
                    aria-label={t("changeAvatar")}
                  >
                    {/* أيقونة القلم */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#0B7459]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7 21H4v-3L16.732 4.732z"
                      />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
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

                <label className="block mb-4">
                  <span className="text-gray-700">{t("email")}</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                </label>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="py-2 px-4 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors duration-300"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-[#0B7459] text-white py-2 px-6 rounded-xl hover:bg-[#095d47] transition-colors duration-300"
                  >
                    {t("SaveChanges")}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
