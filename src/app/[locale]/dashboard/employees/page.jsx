"use client"

import React from 'react';
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/dashboard/CustomActions";
import { useTranslations } from 'next-intl';

const EmployeePage = () => {
    const t = useTranslations();
  
  const columns = [
    { header: 'id', accessor: 'id' },
    { header: t("name-user"), accessor: 'name' },
    { header: t("email"), accessor: 'email' },
    { header: t("phone"), accessor: 'phone' },
    { header: t("role"), accessor: 'role' },
    { header: t("status"), accessor: 'status' },
    {
      header: t("options"),
      accessor: 'options',
      render: (row) => <CustomActions userId={row.id} />,
    },
  ];

  const data = [
    {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '0123456789',
      role: 'مدير',
      status: 'نشط',
    },
    {
      id: 2,
      name: 'سالم علي',
      email: 'salem@example.com',
      phone: '0987654321',
      role: 'مستخدم',
      status: 'غير نشط',
    },
  ];

  return (
    <div>
      <DashboardHeader
        pageTitle={t("users")}
        backUrl="/dashboard"
        addUrl="/dashboard/users/add"
      />
      <center>
        <DashboardTable columns={columns || []} data={data || []} />
      </center>
    </div>
  );
};

export default EmployeePage;