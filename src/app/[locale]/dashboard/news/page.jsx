"use client"

import React from "react";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import { useTranslations } from "next-intl";

const NewsPage = () => {
  const t = useTranslations();



  return (
    <div>
      <DashboardHeader
        pageTitle={t("news")}
        backUrl="/dashboard"
        addUrl="/dashboard/users/add"
      />
      
    </div>
  );
};

export default NewsPage;
