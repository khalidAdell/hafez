"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/modals/CustomActions";
import GenericModal from "../../../../components/modals/GenericModal";
import DeleteModal from "../../../../components/modals/DeleteModal";
import GlobalToast from "../../../../components/GlobalToast";
import { usePathname } from "next/navigation";
import { fetchStatuses, addStatus, updateStatus, deleteStatus, fetchStatusById } from "../../../../lib/api";

const CasesPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: statusesResponse, error: statusesError } = useQuery({
    queryKey: ["statuses", filters, locale],
    queryFn: () => {
      console.log(`Fetching statuses with filters:`, filters);
      return fetchStatuses(filters, locale);
    },
    staleTime: 1 * 60 * 1000,
  });

  const statuses = statusesResponse?.data?.data || [];

  const { data: statusData, error: statusError } = useQuery({
    queryKey: ["status", selectedStatus?.id, locale],
    queryFn: () => fetchStatusById(selectedStatus?.id, locale),
    enabled: !!selectedStatus?.id && isEditModalOpen,
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (statusesError) {
      const errorMessage = statusesError?.message || t("error_loading_data");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else if (statusError) {
      const errorMessage = statusError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [statusesError, statusError, t]);

  const addStatusMutation = useMutation({
    mutationFn: (statusData) => addStatus(statusData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["statuses", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statusData }) => updateStatus({ id, statusData }, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["statuses", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteStatusMutation = useMutation({
    mutationFn: (id) => deleteStatus(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["statuses", filters, locale]);
      toast.success(t("deleted_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const handleSearch = useCallback(
    debounce((searchTerm) => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500),
    []
  );

  const handleFilter = useCallback(
    debounce((newFilters) => {
      console.log("Applying filters:", newFilters);
      setFilters((prev) => ({ ...prev, ...newFilters }));
    }, 500),
    []
  );

  const handleResetFilters = useCallback(() => {
    console.log("Resetting filters");
    setFilters({
      status: "",
      search: "",
      sort_by: "name",
      order: "asc",
      per_page: 15,
      pagination: 0,
    });
  }, []);

  const filterConfig = useMemo(
    () => [
      {
        name: "status",
        label: "status",
        type: "select",
        options: [
          { value: "active", label: "active" },
          { value: "inactive", label: "inactive" },
        ],
      },
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
      },
    ],
    []
  );

  const fieldsConfig = useMemo(
    () => [
      { name: "name_ar", label: "status_name_ar", type: "text", required: true },
      { name: "name_en", label: "status_name_en", type: "text", required: true },
      {
        name: "status",
        label: "status",
        type: "select",
        options: [
          { value: "active", label: "active" },
          { value: "inactive", label: "inactive" },
        ],
        required: true,
      },
    ],
    []
  );

  const searchConfig = { field: "search", placeholder: "search_statuses" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      {
        header: t("status"),
        accessor: "status",
        render: (row) => (
          <span
            className={`px-2 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
              row.status === "active" || row.status === "نشط" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {row.status}
          </span>
        ),
      },
      {
        header: t("created_at"),
        accessor: "created_at_humanly",
      },
      {
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={() => {
              if (row) {
                setSelectedStatus(row);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_status_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedStatus(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_status_selected"), { autoClose: 3000 });
              }
            }}
          />
        ),
      },
    ],
    [t]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("cases")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => setIsAddModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={filters}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={statuses} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addStatusMutation.mutate(data)}
        initialData={{ status: "active" }}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => updateStatusMutation.mutate({ id: selectedStatus.id, statusData: data })}
        initialData={statusData?.data || { name_ar: selectedStatus?.name, name_en: selectedStatus?.name_en || "", status: selectedStatus?.status }}
        isEdit={true}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteStatusMutation.mutate(selectedStatus.id)}
        userName={selectedStatus?.name || ""}
      />
    </div>
  );
};

export default CasesPage;