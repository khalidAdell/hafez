import {
  FaEdit,
  FaBlog,
  FaUsers,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserFriends,
  FaUserShield,
  FaExclamationTriangle,
  FaBriefcase,
  FaBook,
  FaHeart,
  FaMosque,
  FaCircle,
  FaClipboardList,
  FaFile,
  FaImages,
  FaVideo,
  FaNewspaper,
  FaCog,
  FaCloud,
  FaFolder,
  FaQuestionCircle,
  FaPalette,
  FaBookmark,
  FaSchool,
  FaCity
} from "react-icons/fa";

export function getDashboardLinks(t, locale) {

  
  return [
    {
      label: t("articles_blog"),
      icon: FaEdit,
      children: [
        { label: t("sections"), href: `/${locale}/dashboard/articles`, icon: FaEdit },
        { label: t("blog"), href: `/${locale}/dashboard/blogs`, icon: FaBlog },
      ],
      type: "admin",
    },
    {
      label: t("users"),
      icon: FaUsers,
      children: [
        { label: t("user_list"), href: `/${locale}/dashboard/users`, icon: FaUsers },
        { label: t("teachers"), href: `/${locale}/dashboard/teachers`, icon: FaChalkboardTeacher },
        { label: t("students"), href: `/${locale}/dashboard/students`, icon: FaUserGraduate },
        { label: t("parents"), href: `/${locale}/dashboard/parents`, icon: FaUserFriends },
        // { label: t("user_roles"), href: `/${locale}/dashboard/roles`, icon: FaUserShield },
        { label: t("failed_logins_users"), href: `/${locale}/dashboard/users/failed-logins`, icon: FaExclamationTriangle },
      ],
      type: "admin",
    },
    {
      label: t("employees"),
      icon: FaBriefcase,
      children: [
        { label: t("employee_list"), href: `/${locale}/dashboard/employees`, icon: FaBriefcase },
        // { label: t("failed_logins_employees"), href: `/${locale}/dashboard/employees/failed-logins`, icon: FaExclamationTriangle },
      ],
      type: "admin",
      },
    {
      label: t("hafez"),
      icon: FaBook,
      children: [
        { label: t("charities"), href: `/${locale}/dashboard/charities`, icon: FaHeart, type: "admin" },
        { label: t("mosques"), href: `/${locale}/dashboard/mosques`, icon: FaMosque, type: "admin" },
        { label: t("sessions"), href: `/${locale}/dashboard/sessions`, icon: FaCircle, type: "admin" },
        { label: t("timetables"), href: `/${locale}/dashboard/timetables`, icon: FaClipboardList },
        { label: t("children"), href: `/${locale}/dashboard/children`, icon: FaClipboardList, type: "parent" },
        { label: t("students"), href: `/${locale}/dashboard/teacher-students`, icon: FaClipboardList, type: "teacher" },
        { label: t("attendance"), href: `/${locale}/dashboard/attendance`, icon: FaClipboardList, type: "admin" },
        { label: t("actions"), href: `/${locale}/dashboard/actions`, icon: FaClipboardList, type: "admin" },
      ],
      type: ["admin","parent","teacher","student"],
    },
    {
      label: t("attendance"),
      icon: FaClipboardList,
      href: `/${locale}/dashboard/attendance`,
      type: ["parent","teacher","student"],
    },
    {
      label: t("pages"),
      icon: FaFile,
      children: [
        { label: t("sections"), href: `/${locale}/dashboard/sections`, icon: FaFolder },
        { label: t("photos"), href: `/${locale}/dashboard/photos`, icon: FaImages },
        { label: t("videos"), href: `/${locale}/dashboard/videos`, icon: FaVideo },
        { label: t("news"), href: `/${locale}/dashboard/news`, icon: FaNewspaper },
      ],
      type: "admin",
    },
    {
      label: t("system"),
      icon: FaCog,
      children: [
        { label: t("services"), href: `/${locale}/dashboard/services`, icon: FaCloud },
        { label: t("files"), href: `/${locale}/dashboard/files`, icon: FaFolder },
        { label: t("general_settings"), href: `/${locale}/dashboard/settings`, icon: FaCog },
        { label: t("faq"), href: `/${locale}/dashboard/faq`, icon: FaQuestionCircle },
        { label: t("districts"), href: `/${locale}/dashboard/districts`, icon: FaCity },
        { label: t("cities"), href: `/${locale}/dashboard/cities`, icon: FaCity },

      ],
      type: "admin",
    },
    {
      label: t("design_appearance"),
      icon: FaPalette,
      children: [
        { label: t("header_settings"), href: `/${locale}/dashboard/themes/header`, icon: FaCog },
        { label: t("footer_settings"), href: `/${locale}/dashboard/themes/footer`, icon: FaCog },
        // { label: t("pages_settings"), href: `/${locale}/dashboard/themes/pages`, icon: FaFile },
        { label: t("appearance_settings"), href: `/${locale}/dashboard/themes/settings`, icon: FaPalette },
      ],
      type: "admin",
    },
    {
      label: t("study_cases"),
      icon: FaSchool,
      children: [
        { label: t("study_levels"), href: `/${locale}/dashboard/statuses`, icon: FaSchool },
        { label: t("cases"), href: `/${locale}/dashboard/cases`, icon: FaBookmark },
      ],
      type: "admin",
    },
  ];
}
