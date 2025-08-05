"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

export default function Footer({ config }) {
  const t = useTranslations();

  const social = config?.social_links || {};
  const footerLogo = config?.images?.footer_logo || "/logo.png";

  return (
    <footer className="text-gray-600 bg-gray-100">
      <div className="container mx-auto px-5 py-8 flex flex-col sm:flex-row items-center">
        <div className="flex flex-col sm:flex-row justify-between w-full items-center">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/"
              className="flex items-center justify-center md:justify-start"
            >
              <Image
                src={footerLogo}
                width={64}
                height={56}
                alt="Hafez Footer Logo"
                className="h-14 sm:h-16 object-cover w-16 max-h-16"
                style={{ height: "auto" }} 
              />
            </Link>
            <p className="text-gray-600 text-center sm:text-left">
              © 2023 {t("brand")} — <span className="ml-1">{t("rights")}</span>
              <span className="mx-1">-</span>
              <Link href="https://share.net.sa" className="text-[#0B7459]">
                {t("madeby")}
              </Link>
            </p>
          </div>

          <span className="inline-flex mt-4 sm:mt-0 justify-center sm:justify-end gap-3 text-xl">
            {social.facebook && (
              <Link
                href={social.facebook}
                className="text-gray-500 hover:text-[#0B7459]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook />
              </Link>
            )}
            {social.instagram && (
              <Link
                href={social.instagram}
                className="text-gray-500 hover:text-[#0B7459]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </Link>
            )}
            {social.twitter && (
              <Link
                href={social.twitter}
                className="text-gray-500 hover:text-[#0B7459]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter />
              </Link>
            )}
            {social.youtube && (
              <Link
                href={social.youtube}
                className="text-gray-500 hover:text-[#0B7459]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube />
              </Link>
            )}
            {social.linkedin && (
              <Link
                href={social.linkedin}
                className="text-gray-500 hover:text-[#0B7459]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin />
              </Link>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
