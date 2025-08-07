"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import GenericModal from "../../../../components/modals/GenericModal";
import GlobalToast from "../../../../components/GlobalToast";
import { fetchStudents, addStudent, fetchStudentsStudyLevels, fetchStudentsParents } from "../../../../lib/api";
import { usePathname } from "next/navigation";
import { useUser } from "../../../../context/userContext";

const StudentsPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    gender: "",
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: studyLevels = [], error: studyLevelsError } = useQuery({
    queryKey: ["studyLevels", locale],
    queryFn: () =>
      fetchStudentsStudyLevels({}, locale, user?.type).then((res) => {
        
        if (!res.data) {
          throw new Error(t("error_fetching_study_levels"));
        }
        return res.data;
      }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: parentsResponse, error: parentsError } = useQuery({
    queryKey: ["parents", locale],
    queryFn: () =>
      fetchStudentsParents({}, locale, user?.type).then((res) => {
        if (!res.data) {
          throw new Error(t("error_fetching_parents"));
        }
        return res.data;
      }),
    staleTime: 5 * 60 * 1000,
  });

  const parents = parentsResponse || [];

  const { data: studentsResponse, error: studentsError } = useQuery({
    queryKey: ["students", filters, locale],
    queryFn: () => {
      return fetchStudents({ ...filters }, locale, user?.type);
    },
    staleTime: 1 * 60 * 1000,
  });

  const users = studentsResponse?.data?.data.map((user) => ({
    ...user,
    study_level_name: user.study_level?.name || user.study_level,
    parent_name: user.parent?.name || user.parent,
  }));

  useEffect(() => {
    if (studyLevelsError || parentsError || studentsError) {
      const errorMessage =
        studyLevelsError?.message ||
        parentsError?.message ||
        studentsError?.message ||
        t("error_loading_students");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [studyLevelsError, parentsError, studentsError, t]);

  const addStudentMutation = useMutation({
    mutationFn: (studentData) => addStudent(studentData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["students", filters, locale]);
      queryClient.invalidateQueries(["parents", locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const response = err.response?.data;
      let errorMessage = response?.message || t("error");
      if (response?.data && typeof response.data === "object") {
        const fieldErrors = Object.entries(response.data)
          .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
          .join(" | ");
        errorMessage += ` - ${fieldErrors}`;
      }
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
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
      const updatedFilters = { ...newFilters };
      setFilters((prev) => ({ ...prev, ...updatedFilters }));
    }, 500),
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      status: "",
      search: "",
      sort_by: "name",
      order: "asc",
      per_page: 15,
      gender: "",
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
          { value: "active", label: t("active") },
          { value: "inactive", label: t("inactive") },
          { value: "pending", label: t("pending") },
        ],
      },
      {
        name: "gender",
        label: "gender",
        type: "select",
        options: [
          { value: "male", label: t("male") },
          { value: "female", label: t("female") },
        ],
      },
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
      },
    ],
    [t]
  );

  const fieldsConfig = useMemo(
    () => [
      {
        name: "name",
        label: "name",
        type: "text",
        required: true,
        minLength: 3,
        maxLength: 255,
      },
      {
        name: "email",
        label: "email",
        type: "email",
        required: true,
        maxLength: 255,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      },
      {
        name: "phone",
        label: "phone",
        type: "text",
        required: true,
        maxLength: 255,
      },
      {
        name: "national_id",
        label: "national_id",
        type: "text",
        required: true,
        maxLength: 255,
      },
      {
        name: "gender",
        label: "gender",
        type: "select",
        required: true,
        options: [
          { value: "male", label: t("male") },
          { value: "female", label: t("female") },
        ],
      },
      {
        name: "study_level_id",
        label: "study_level",
        type: "select",
        required: true,
        options: Array.isArray(studyLevels)
          ? studyLevels.map((level) => ({
              value: level.id,
              label:
                locale === "ar"
                  ? level.name_ar || level.name
                  : level.name_en || level.name,
            }))
          : [],
      },
      {
        name: "parent_id",
        label: "parent",
        type: "select",
        required: true,
        options: Array.isArray(parents)
          ? parents.map((parent) => ({
              value: parent.id,
              label: parent.name,
            }))
          : [],
      },
    ],
    [studyLevels, parents, locale, t]
  );

  const searchConfig = { field: "search", placeholder: "search_students" };

  const optimizedFetchDependencies = useMemo(
    () => ({
      study_level_id: async () => {
        const cachedData = queryClient.getQueryData(["studyLevels", locale]);
        if (cachedData) {
          return Array.isArray(cachedData) ? cachedData : cachedData.data || [];
        }
        return await fetchStudentsStudyLevels({}, locale, user?.type).then(
          (res) => res.data.data || []
        );
      },
      parent_id: async () => {
        const cachedData = queryClient.getQueryData(["parents", locale]);
        if (cachedData) {
          return Array.isArray(cachedData) ? cachedData : cachedData.data || [];
        }
        return await fetchStudentsParents({}, locale, user?.type).then(
          (res) => res.data.data || []
        );
      },
    }),
    [locale, queryClient, user?.type]
  );

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      { header: t("email"), accessor: "email" },
      { header: t("phone"), accessor: "phone" },
      { header: t("study_level"), accessor: "study_level_name" },
      { header: t("parent"), accessor: "parent_name" },
      {
        header: t("status"),
        accessor: "status",
        render: (row) => (
          <span
            className={`px-2 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
              row.status === "active" || row.status === "نشط"
                ? "bg-green-100 text-green-800"
                : row.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.status}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* <GlobalToast /> */}
      <DashboardHeader
        pageTitle={t("students")}
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
        <DashboardTable columns={columns} data={users} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addStudentMutation.mutate(data)}
        initialData={{
          name: "",
          email: "",
          phone: "",
          national_id: "",
          gender: "male",
          study_level_id: "",
          parent_id: "",
        }}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
      />
    </div>
  );
};

export default StudentsPage;