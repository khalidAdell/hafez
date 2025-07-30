"use client"

import React from "react";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/dashboard/CustomActions";
import { useTranslations } from "next-intl";

const SectionsPage = () => {
    const t = useTranslations();
  
  const columns = [
    { header: "id", accessor: "id" },
    { header:t("name"), accessor: "name" },
    { header: t("date"), accessor: "date" },
    {
      header: t("options"),
      accessor: "options",
      render: (row) => <CustomActions articleId={row.id} />,
    },
  ];

  const data = [
    {
      id: "6",
      name: " يوسف احمد	",
      date: "الخميس, 17 يوليو 2025, 1:55 م",
    },
    {
      id: "2",
      name: " يوسف احمد	",
      date: "الخميس, 17 يوليو 2025, 1:55 م",
    },
  ];

  return (
    <div>
      <DashboardHeader
        pageTitle={t("Sections")}
        backUrl="/dashboard"
        addUrl="/dashboard/users/add"
      />
      <center>
        <DashboardTable columns={columns || []} data={data || []} />
      </center>
    </div>
  );
};

export default SectionsPage;
