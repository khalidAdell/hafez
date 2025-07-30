"use client"
import React from 'react';
import DashboardHeader from '../../../../components/dashboard/DashboardHeader';
import { useTranslations } from 'next-intl';

const TimeTables = () => {

const t = useTranslations();
  return (
    <div>
      <DashboardHeader
        pageTitle={t("student-plans")}
        backUrl="/dashboard"
        addUrl="/dashboard/users/add"
      />
     
    </div>
  );
};

export default TimeTables;