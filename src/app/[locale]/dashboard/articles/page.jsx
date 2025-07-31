"use client";

import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/dashboard/CustomActions";

import { useTranslations } from "next-intl";

const page = () => {
  const t = useTranslations();

  const columns = [
    { header:t("name"), accessor: "name" },
    { header: t("email"), accessor: "email" },
    { header: t("date"), accessor: "date" },
    {
      header: t("options"),
      accessor: 'options',
      render: (row) => <CustomActions articleId={row.id} />,
    },
  ];

  const data = [
    { name: "أحمد ", email: "ahmed@example.com", date: "2023-10-01" },
    { name: " علي", email: "sarah@example.com", date: "2023-10-02" },
  ];

  return (
    <div>
      <DashboardHeader
        pageTitle={t("articles")}
        backUrl="/dashboard"
        addUrl="/dashboard/users/add"
      />
      <DashboardTable columns={columns} data={data} />
    </div>
  );
};

export default page;
