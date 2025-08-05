"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

const FormikForm = () => {
  const t = useTranslations();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t("nameRequired") || "الاسم مطلوب"),
      email: Yup.string()
        .email(t("emailInvalid") || "بريد إلكتروني غير صحيح")
        .required(t("emailRequired") || "البريد الإلكتروني مطلوب"),
      phone: Yup.string().required(t("phoneRequired") || "رقم الهاتف مطلوب"),
      message: Yup.string().required(t("messageRequired") || "الرسالة مطلوبة"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await axios.post(
          "https://7afez.share.net.sa/api/contact-us",
          values,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": "ar",
            },
          }
        );

        if (response.data.success) {
          toast.success(
            response.data.message ||
              t("submitSuccess") ||
              "تم إرسال الرسالة بنجاح"
          );
          resetForm();
        } else {
          toast.error(
            response.data.message ||
              t("submitFailed") ||
              "حدث خطأ أثناء الإرسال"
          );
        }
      } catch (error) {
        console.error(error);
        toast.error(t("submitFailed") || "حدث خطأ أثناء الإرسال");
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="space-y-7 mt-5">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <input
            type="text"
            name="name"
            placeholder={t("name") || "الاسم"}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full p-2 rounded-xl border ${
              formik.touched.name && formik.errors.name
                ? "border-white"
                : "border-gray-300"
            } text-gray-900`}
            required
          />
          {formik.touched.name && formik.errors.name ? (
            <div className=" text-sm">{formik.errors.name}</div>
          ) : null}

          <input
            type="email"
            name="email"
            placeholder={t("email") || "البريد الإلكتروني"}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full p-2 rounded-xl border ${
              formik.touched.email && formik.errors.email
                ? "border-white"
                : "border-gray-300"
            } text-gray-900`}
            required
          />
          {formik.touched.email && formik.errors.email ? (
            <div className=" text-sm">{formik.errors.email}</div>
          ) : null}

          <input
            type="text"
            name="phone"
            placeholder={t("phone") || "رقم الهاتف"}
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full p-2 rounded-xl border ${
              formik.touched.phone && formik.errors.phone
                ? "border-white"
                : "border-gray-300"
            } text-gray-900`}
            required
          />
          {formik.touched.phone && formik.errors.phone ? (
            <div className=" text-sm">{formik.errors.phone}</div>
          ) : null}
        </div>

        <textarea
          name="message"
          rows="5"
          placeholder={t("messagePlaceholder") || "الرسالة"}
          value={formik.values.message}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full p-2 rounded-xl border ${
            formik.touched.message && formik.errors.message
              ? "border-white"
              : "border-gray-300"
          } text-gray-900`}
          required
        ></textarea>
        {formik.touched.message && formik.errors.message ? (
          <div className=" text-sm">{formik.errors.message}</div>
        ) : null}

        <div className="flex md:justify-start justify-center">
          <button
            type="submit"
            className="x-btn x-btn-white x-btn-outline text-white py-2 px-4 rounded border border-white hover:bg-white hover:text-black"
          >
            {t("submit")}
          </button>
        </div>
      </form>
    </>
  );
};

export default FormikForm;
