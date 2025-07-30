"use client";
import React from "react";

import DashboardHeader from "../../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../../components/dashboard/CustomActions";
import { useTranslations } from "next-intl";

const Pages = () => {
  const t = useTranslations();
  const columns = [
    { header: "id", accessor: "id" },
    { header: t("name"), accessor: "name" },
    { header: t("address"), accessor: "address" },
    { header: t("link"), accessor: "link" },
    { header: t("status"), accessor: "status" },
    { header: t("date"), accessor: "date" },

    {
      header: t("options"),
      accessor: "options",
      render: (row) => <CustomActions userId={row.id} />,
    },
  ];

  const data = [
    {
      id: 1,
      name: " الطلاب",
      address: "جديد",
      link: "https://zawaj.share.net.sa/mc	",
      status: "نشط",
      date: "2/5/2025",
    },
    {
      id: 1,
      name: " الطلاب",
      address: "جديد",
      link: "https://zawaj.share.net.sa/mc	",
      status: "نشط",
      date: "2/5/2025",
    },
  ];

  return (
    <div>
      <DashboardHeader
        pageTitle={t("page-sttings")}
        backUrl="/dashboard"
        addUrl="/dashboard/users/add"
      />
      <center>
        <DashboardTable columns={columns || []} data={data || []} />
      </center>
    </div>
  );
};

export default Pages;
