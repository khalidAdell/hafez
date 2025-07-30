"use client"

import React from "react";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/dashboard/CustomActions";
import { useTranslations } from "next-intl";

const CasesPage = () => {
    const t = useTranslations();
  
  const columns = [
    { header: "المعرف", accessor: "id" },
    { header:t("name"), accessor: "title" },
    { header: t("status"), accessor: "status" },
    { header: t("date"), accessor: "date" },
    {
      header: t("options"),
      accessor: "options",
      render: (row) => <CustomActions articleId={row.id} />,
    },
  ];

  const data = [
    {
      id: 1,
      title: "مقال عن التكنولوجيا الحديثة",
      status: "نشط",
      date: "2025-07-01",
    },
    {
      id: 2,
      title: "كيفية تحسين الأداء التقني",
      status: "نشط",
      date: "2025-07-15",
    },
  ];

  return (
    <div>
      <DashboardHeader
        pageTitle={t("cases")}
        backUrl="/dashboard"
        addUrl="/dashboard/articles/add"
      />
      <center>
        <DashboardTable columns={columns} data={data} />
      </center>
    </div>
  );
};

export default CasesPage;
