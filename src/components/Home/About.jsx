"use client";

import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const CountUp = dynamic(() => import("react-countup"), {
  ssr: false,
});

const About = ({ about }) => {
  const t = useTranslations();

  if (!about) return null;

  return (
    <div className="mx-auto max-w-7xl mt-10">
      <section className="bg-white">
        <div className="container mx-auto py-8 px-4 lg:grid lg:grid-cols-2 lg:gap-16 lg:py-16 lg:px-6 ">
          <div className="mt-16" id="about">
            <h2 className="text-4xl font-bold">{about.title}</h2>
            <p className="mt-4 text-gray-500 text-md">{about.description}</p>

            <div className="grid grid-cols-3 gap-3 text-3xl font-bold text-primary my-10">
              <div>
                <span className="text-[#0B7459] font-bold text-3xl">
                  <CountUp end={about.counts.teacher} duration={2} />
                </span>
                <div className="text-xl text-black">{t("teachersLabel")}</div>
              </div>
              <div>
                <span className="text-[#0B7459] font-bold text-3xl">
                  <CountUp end={about.counts.student} duration={2} />+
                </span>
                <div className="text-xl text-black">{t("studentsLabel")}</div>
              </div>
              <div>
                <span className="text-[#0B7459] font-bold text-3xl">
                  <CountUp end={about.counts.mosque} duration={2} />+
                </span>
                <div className="text-xl text-black">{t("mosquesLabel")}</div>
              </div>
            </div>

            <button className="bg-[#0B7459] rounded-xl text-white py-2 px-4 hover:bg-[#0B7459]/80 flex justify-center items-center">
              {t("ctaButton")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Image
              src="/about-1.jpg"
              width={300}
              height={200}
              alt="image about"
              className="w-full rounded-lg"
              priority
            />
            <Image
              src="/about-2.jpg"
              width={300}
              height={200}
              alt="image about"
              className="mt-4 w-full lg:mt-10 rounded-lg"
              priority
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
