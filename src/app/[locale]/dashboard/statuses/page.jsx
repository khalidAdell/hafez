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
import { fetchStudyLevels, addStudyLevel, updateStudyLevel, deleteStudyLevel, fetchStudyLevelById } from "../../../../lib/api";

const StatusesPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudyLevel, setSelectedStudyLevel] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: studyLevelsResponse, error: studyLevelsError } = useQuery({
    queryKey: ["studyLevels", filters, locale],
    queryFn: () => {
      console.log(`Fetching study levels with filters:`, filters);
      return fetchStudyLevels(filters, locale);
    },
    staleTime: 1 * 60 * 1000,
  });

  const studyLevels = studyLevelsResponse?.data?.data || [];

  const { data: studyLevelData, error: studyLevelError } = useQuery({
    queryKey: ["studyLevel", selectedStudyLevel?.id, locale],
    queryFn: () => fetchStudyLevelById(selectedStudyLevel?.id, locale),
    enabled: !!selectedStudyLevel?.id && isEditModalOpen,
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (studyLevelsError) {
      const errorMessage = studyLevelsError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else if (studyLevelError) {
      const errorMessage = studyLevelError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [studyLevelsError, studyLevelError, t]);

  const addStudyLevelMutation = useMutation({
    mutationFn: (studyLevelData) => addStudyLevel(studyLevelData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["studyLevels", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateStudyLevelMutation = useMutation({
    mutationFn: ({ id, studyLevelData }) => updateStudyLevel({ id, studyLevelData }, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["studyLevels", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteStudyLevelMutation = useMutation({
    mutationFn: (id) => deleteStudyLevel(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["studyLevels", filters, locale]);
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
      { name: "name_ar", label: "study_level_name_ar", type: "text", required: true },
      { name: "name_en", label: "study_level_name_en", type: "text", required: true },
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

  const searchConfig = { field: "search", placeholder: "search_study_levels" };

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
                setSelectedStudyLevel(row);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_study_level_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedStudyLevel(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_study_level_selected"), { autoClose: 3000 });
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
      {/* <GlobalToast /> */}
      <DashboardHeader
        pageTitle={t("study_levels")}
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
        <DashboardTable columns={columns} data={studyLevels} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addStudyLevelMutation.mutate(data)}
        initialData={{ status: "active" }}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => updateStudyLevelMutation.mutate({ id: selectedStudyLevel.id, studyLevelData: data })}
        initialData={studyLevelData?.data || { name_ar: selectedStudyLevel?.name, name_en: selectedStudyLevel?.name_en || "", status: selectedStudyLevel?.status }}
        isEdit={true}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteStudyLevelMutation.mutate(selectedStudyLevel.id)}
        userName={selectedStudyLevel?.name || ""}
      />
    </div>
  );
};

export default StatusesPage;