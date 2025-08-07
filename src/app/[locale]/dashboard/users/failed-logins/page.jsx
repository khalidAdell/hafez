"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "../../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../../components/dashboard/DashboardTable";
import GlobalToast from "../../../../../components/GlobalToast";
import { fetchFailedLogins } from "../../../../../lib/api";
import { usePathname } from "next/navigation";

const FailedLoginPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const [filters, setFilters] = useState({
    search: "",
    sort_by: "created_at",
    order: "desc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: failedLogins = [], error: failedLoginsError } = useQuery({
    queryKey: ["failedLogins", locale],
    queryFn: () => fetchFailedLogins(locale).then((res) => res.data),
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (failedLoginsError) {
      const errorMessage = failedLoginsError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [failedLoginsError, t]);

  const handleSearch = useCallback(
    debounce((searchTerm) => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500),
    []
  );

  const handleFilter = useCallback(
    debounce((newFilters) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    }, 500),
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: "",
      sort_by: "created_at",
      order: "desc",
      per_page: 15,
      pagination: 0,
    });
  }, []);

  const filterConfig = useMemo(
    () => [
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
      },
      {
        name: "browser",
        label: "browser",
        type: "select",
        options: [
          { value: "Chrome", label: "Chrome" },
          { value: "Safari", label: "Safari" },
          { value: "Firefox", label: "Firefox" },
          { value: "Edge", label: "Edge" },
          { value: "Opera", label: "Opera" },
        ],
      },
    ],
    []
  );

  const searchConfig = { field: "search", placeholder: "search_login_attempts" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("proccess"), accessor: "description" },
      { header: t("device"), accessor: "device_name" },
      {
        header: t("browser"),
        accessor: "browser",
        render: (row) =>
          row.browser_logo ? (
            <div className="flex items-center">
              <img src={row.browser_logo} alt={row.browser} className="w-6 h-6 mr-2" />
              {row.browser || t("unknown")}
            </div>
          ) : (
            row.browser || t("unknown")
          ),
      },
      { header: t("system"), accessor: "operating_system" },
      { header: t("login_info"), accessor: "mail" },
      {
        header: t("date"),
        accessor: "created_at",
        render: (row) => row.created_at || t("not_specified"),
      },
    ],
    [t]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* <GlobalToast /> */}
      <DashboardHeader
        pageTitle={t("login_attempts")}
        backUrl={`/${locale}/dashboard`}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={filters}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={failedLogins} />
      </center>
    </div>
  );
};

export default FailedLoginPage;