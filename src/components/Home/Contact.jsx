'use client';

import React from "react";
import { MdEmail, MdOutlineAccessTime } from "react-icons/md";
import { BsTelephoneX } from "react-icons/bs";
import { useTranslations } from "next-intl";
import FormikForm from "./FormikForm";
import GlobalToast from "../../components/GlobalToast";

const Contact = ({ contactConfig }) => {
  const t = useTranslations();

  // استخدم البيانات من contactConfig مع fallback للقيم الافتراضية إذا لم تتوفر
  const phone = contactConfig?.phone || "+0000000000";
  const email = contactConfig?.email || "info@example.com";
  const workingHours = contactConfig?.working_hours || "من 9 صباحًا إلى 5 مساءً";

  return (
    <div>
      <section
        id="contact"
        className="py-20"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,.1), rgba(0,0,0,.1)), linear-gradient(103.1deg, rgb(11,116,89) -2.23%, rgba(86,108,17,.9) 56.5%, rgba(86,108,17,.9) 101.31%)",
        }}
      >
        <div className="container mx-auto px-5">
          <div className="text-white grid md:grid-cols-5 grid-cols-1 md:gap-5">
            <div className="py-16 md:px-0 px-10 col-span-3 md:order-first order-last md:pr-10">
              <div className="text-sm text-yellow-500">{t("contact")}</div>
              <h2 className="text-3xl font-bold text-white mt-3 mb-5">{t("be-contact")}</h2>
              <FormikForm />
            </div>

            <div className="col-span-2">
              <div className="py-10 md:px-16 px-3 bg-white h-full text-black rounded-xl shadow-lg">
                <h2 className="text-3xl px-2 font-bold">{t("contact-info")}</h2>
                <ul className="mt-10 space-y-4">
                  <li className="flex items-center gap-4">
                    <BsTelephoneX className="text-4xl" />
                    <div>
                      <h3>{t("phone")}</h3>
                      <a href={`tel:${phone}`} className="text-[#0B7459] hover:underline">
                        {phone}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <MdEmail className="text-4xl" />
                    <div>
                      <h3>{t("email")}</h3>
                      <a href={`mailto:${email}`} className="text-[#0B7459] hover:underline">
                        {email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <MdOutlineAccessTime className="text-4xl" />
                    <div>
                      <h3>{t("worktime")}</h3>
                      {/* يفضل أن تحافظ على نصوص HTML إذا كانت موجودة في working_hours، لكن هنا استخدمت نص عادي */}
                      <p dangerouslySetInnerHTML={{ __html: workingHours }} />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <GlobalToast closeButton={true} />
    </div>
  );
};

export default Contact;
