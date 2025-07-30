"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Navbar from "../../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { FaRegEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import createAxiosInstance from "../../../lib/axiosInstance";

const Login = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const locale = pathname.split("/")[1] || "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let tempErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      tempErrors.email = t("emailRequired");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = t("emailInvalid");
      isValid = false;
    }

    if (!password) {
      tempErrors.password = t("requiredPassword");
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({ email: "", password: "" });

    try {
      const axiosInstance = createAxiosInstance();

      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
        rememberMe,
      });

      const data = response.data;

      if (data.success) {
        toast.success(t("loginSuccess"));

        Cookies.set("token", data.data.token, {
          expires: rememberMe ? 7 : undefined,
          secure: true,
          sameSite: "Lax",
        });

        router.push(`/${locale}/dashboard`);
      } else {
        toast.error(data.message || t("loginError"));
      }
    } catch (error) {
      if (error.response?.data) {
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
        toast.error(error.response.data.message || t("loginError"));
      } else {
        toast.error(t("unexpectedError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar forceScrolledStyle={true} />
      <div className="min-h-screen bg-gray-50">
        <section className="md:h-screen h-auto w-full py-20 flex items-center mt-20">
          <div className="container mx-auto h-full md:p-0 p-5">
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-20 gap-5 h-full">
              {/* صورة جانبية */}
              <div className="flex items-center justify-center">
                <Image
                  src="/login.jpg"
                  width={500}
                  height={500}
                  alt="Login"
                  className="w-full h-auto object-cover rounded-xl"
                />
              </div>

              {/* فورم تسجيل الدخول */}
              <div className="flex items-center">
                <div className="border border-gray-200 rounded-xl pt-10 py-5 lg:px-12 px-5 max-w-xl mx-auto w-full flex items-center bg-white shadow-lg">
                  <div className="w-full">
                    <div className="flex justify-center flex-col text-center">
                      <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        {t("login")}
                      </h2>
                    </div>

                    <form
                      className="space-y-5"
                      onSubmit={handleSubmit}
                      noValidate
                    >
                      <div className="flex flex-col">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("email")}
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                            errors.email
                              ? "border-red-600 focus:ring-red-600"
                              : "border-gray-300 focus:ring-[#0B7459]"
                          } text-black`}
                          placeholder={t("enterEmail")}
                        />
                        {errors.email && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </span>
                        )}
                      </div>

                      <div className="relative flex flex-col">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("password")}
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                            errors.password
                              ? "border-red-600 focus:ring-red-600"
                              : "border-gray-300 focus:ring-[#0B7459]"
                          } text-black`}
                          placeholder={t("enterPassword")}
                        />
                        <div
                          className="absolute rtl:left-3 ltr:right-3 top-10 cursor-pointer group"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? t("hidePassword") : t("showPassword")
                          }
                        >
                          {showPassword ? (
                            <IoEyeOutline
                              className="text-gray-500 group-hover:text-[#0B7459] transition-colors duration-300"
                              size={20}
                            />
                          ) : (
                            <FaRegEyeSlash
                              className="text-gray-500 group-hover:text-[#0B7459] transition-colors duration-300"
                              size={20}
                            />
                          )}
                        </div>
                        {errors.password && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.password}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <input
                            id="rememberMe"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-[#0B7459] bg-gray-100 border-gray-300 rounded focus:ring-[#0B7459]"
                          />
                          <label
                            htmlFor="rememberMe"
                            className="rtl:mr-2 ltr:ml-2 text-sm font-medium text-gray-900"
                          >
                            {t("rememberMe")}
                          </label>
                        </div>
                        <Link
                          href="/forgot-password"
                          className="text-[#0B7459] text-sm hover:text-[#095c47] transition-colors duration-300"
                        >
                          {t("forgotPassword")}
                        </Link>
                      </div>

                      {/* زر الدخول */}
                      <div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-2 px-4 rounded-md text-white ${
                            isSubmitting
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[#0B7459] hover:bg-[#095c47]"
                          } transition-colors duration-300`}
                        >
                          {t("login")}
                        </button>
                      </div>
                    </form>

                    <div className="text-sm text-center mt-10">
                      {t("noAccount")}{" "}
                      <Link
                        href={`/${locale}/register`}
                        className="text-[#0B7459] hover:text-[#095c47] transition-colors duration-300"
                      >
                        {t("registerNow")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
