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
import { fetchSessions, addSession, updateSession, deleteSession, fetchMosques, fetchUsers} from "../../../../lib/api";
import { usePathname } from "next/navigation";

const SessionsPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    mosque_id: "",
    teacher_id: "",
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: mosques = [], error: mosquesError } = useQuery({
    queryKey: ["mosques", locale],
    queryFn: () => {
      return fetchMosques({}, locale).then((res) => res.data.data);
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: teachers = [], error: teachersError } = useQuery({
    queryKey: ["teachers", locale],
    queryFn: () => {
      return fetchUsers({ type: "teacher" }, locale).then((res) => res.data.data);
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: sessions = [], error: sessionsError } = useQuery({
    queryKey: ["sessions", filters, locale],
    queryFn: () => {
      console.log(`Fetching sessions with filters:`, filters);
      return fetchSessions(filters, locale).then((res) => res.data.data);
    },
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (mosquesError || teachersError || sessionsError) {
      const errorMessage =
        mosquesError?.message ||
        teachersError?.message ||
        sessionsError?.message ||
        t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [mosquesError, teachersError, sessionsError, t]);

  const addSessionMutation = useMutation({
    mutationFn: (sessionData) => addSession(sessionData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["sessions", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, sessionData }) => updateSession(id, sessionData, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["sessions", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id) => deleteSession(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["sessions", filters, locale]);
      toast.success(t("session_deleted_successfully"), { autoClose: 3000 });
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
      const updatedFilters = { ...newFilters };
      if (newFilters.mosque_name) {
        const selectedMosque = mosques.find((mosque) => mosque.name === newFilters.mosque_name);
        updatedFilters.mosque_id = selectedMosque ? selectedMosque.id : "";
      } else {
        updatedFilters.mosque_id = "";
      }
      if (newFilters.teacher_name) {
        const selectedTeacher = teachers.find((teacher) => teacher.name === newFilters.teacher_name);
        updatedFilters.teacher_id = selectedTeacher ? selectedTeacher.id : "";
      } else {
        updatedFilters.teacher_id = "";
      }
      delete updatedFilters.mosque_name;
      delete updatedFilters.teacher_name;
      setFilters((prev) => ({ ...prev, ...updatedFilters }));
    }, 500),
    [mosques, teachers]
  );

  const handleResetFilters = useCallback(() => {
    console.log("Resetting filters");
    setFilters({
      status: "active",
      search: "",
      sort_by: "name",
      order: "asc",
      per_page: 15,
      mosque_id: "",
      teacher_id: "",
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
        ],
      },
      {
        name: "mosque_name",
        label: "mosque",
        type: "select",
        options: mosques.map((mosque) => ({ value: mosque.name, label: mosque.name })),
      },
      {
        name: "teacher_name",
        label: "teacher",
        type: "select",
        options: teachers.map((teacher) => ({ value: teacher.name, label: teacher.name })),
      },
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
      },
    ],
    [mosques, teachers]
  );

  const fieldsConfig = useMemo(
    () => [
      { name: "name_ar", label: "name_ar", type: "text", required: true },
      { name: "name_en", label: "name_en", type: "text", required: true },
      {
        name: "teacher_id",
        label: "teacher",
        type: "select",
        options: teachers.map((teacher) => ({ value: teacher.id, label: teacher.name })),
      },
      {
        name: "mosque_id",
        label: "mosque",
        type: "select",
        options: mosques.map((mosque) => ({ value: mosque.id, label: mosque.name })),
      },
      {
        name: "status",
        label: "status",
        type: "select",
        options: [
          { value: "active", label: t("active") },
          { value: "inactive", label: t("inactive") },
        ],
      },
    ],
    [mosques, teachers]
  );

  const searchConfig = { field: "search", placeholder: "search_sessions" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      {
        header: t("teacher"),
        accessor: "teacher",
        render: (row) => row.teacher?.name || "غير محدد",
      },
      {
        header: t("mosque"),
        accessor: "mosque",
        render: (row) => row.mosque?.name || "غير محدد",
      },
      {
        header: t("date"),
        accessor: "created_at",
        render: (row) => row.created_at || "غير محدد",
      },
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
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={() => {
              if (row) {
                setSelectedSession(row);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_session_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedSession(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_session_selected"), { autoClose: 3000 });
              }
            }}
          />
        ),
      },
    ],
    [t]
  );

  const optimizedFetchDependencies = useMemo(
    () => ({
      mosque_id: async () => {
        const cachedData = queryClient.getQueryData(["mosques", locale]);
        if (cachedData) {
          console.log("Using cached mosques data");
          return cachedData;
        }
        console.log("Fetching mosques for modal");
        return await fetchMosques({}, locale).then((res) => res.data.data);
      },
      teacher_id: async () => {
        const cachedData = queryClient.getQueryData(["teachers", locale]);
        if (cachedData) {
          console.log("Using cached teachers data");
          return cachedData;
        }
        console.log("Fetching teachers for modal");
        return await fetchUsers({ type: "teacher" }, locale).then((res) => res.data.data);
      },
    }),
    [locale, queryClient]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("Episodes")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => setIsAddModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={{
          ...filters,
          mosque_name: mosques.find((mosque) => mosque.id === filters.mosque_id)?.name || "",
          teacher_name: teachers.find((teacher) => teacher.id === filters.teacher_id)?.name || "",
        }}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={sessions} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addSessionMutation.mutate(data)}
        initialData={{  status: "" }}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => updateSessionMutation.mutate({ id: selectedSession.id, sessionData: data })}
        initialData={selectedSession || {}}
        isEdit={true}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteSessionMutation.mutate(selectedSession.id)}
        userName={selectedSession?.name || ""}
      />
    </div>
  );
};

export default SessionsPage;