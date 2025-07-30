"use client"

import React from 'react';
import DashboardHeader from "../../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../../components/dashboard/DashboardTable";

import { useTranslations } from 'next-intl';

const FailedLoginPage = () => {
  const t = useTranslations();
  
  const columns = [
    { header: t("proccess"), accessor: 'proccess' },
    { header: t("advice"), accessor: 'advice' },
    { header:t("browser"), accessor: 'browser' },
    { header: t("system"), accessor: 'system' },
    { header: t("login-info"), accessor: 'data' },
    { header: t("date"), accessor: 'date' },
  
  ];

  const data = [
    {
      proccess: 'حاول تسجيل الدخول	',
      advice: ' iPhone	',
      browser: 'Chrome',
      system: 'Windows 10.0	',
      data: 'admin@share.net.sa',
      date: 'الخميس, 17 يوليو 2025, 1:55 م',
    },
   {
      proccess: 'حاول تسجيل الدخول	',
      advice: ' iPhone	',
      browser: 'Chrome',
      system: 'Windows 10.0	',
      data: 'admin@share.net.sa',
      date: 'الخميس, 17 يوليو 2025, 1:55 م',
    },
  ];

  return (
    <div>
      <DashboardHeader
        pageTitle={t("Login-attempts")}
        backUrl="/dashboard"
        addUrl="/dashboard/users/add"
      />
      <center>
        <DashboardTable columns={columns || []} data={data || []} />
      </center>
    </div>
  );
};

export default FailedLoginPage;