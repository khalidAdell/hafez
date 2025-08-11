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
import { fetchActions, showAction, addActions, updateActions, deleteActions, fetchUsers } from "../../../../lib/api";
import { usePathname } from "next/navigation";

const ActionsPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort_by: "date",
    order: "asc",
    per_page: 15,
    user_id: "",
    pagination: 0,
  });
  const [error, setError] = useState(null);

  // Fetch users for the user_id filter and modal
  const { data: users = [], error: usersError } = useQuery({
    queryKey: ["users", locale],
    queryFn: () => {
      return fetchUsers({
        type: "student",
      }, locale).then((res) => res.data.data);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch actions
  const { data: actions = [], error: actionsError } = useQuery({
    queryKey: ["actions", filters, locale],
    queryFn: () => {
      return fetchActions(filters, locale).then((res) => res.data.data);
    },
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (usersError || actionsError) {
      const errorMessage = usersError?.message || actionsError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [usersError, actionsError, t]);

  // Add action mutation
  const addActionMutation = useMutation({
    mutationFn: (actionData) => addActions(actionData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["actions", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // Update action mutation
  const updateActionMutation = useMutation({
    mutationFn: ({ id, actionData }) => {
      return updateActions({ id, actionData }, locale);
    },
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["actions", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      console.error("Update error:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // Delete action mutation
  const deleteActionMutation = useMutation({
    mutationFn: (id) => deleteActions(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["actions", filters, locale]);
      toast.success(t("action_deleted_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((searchTerm) => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500),
    []
  );

  // Debounced filter handler
  const handleFilter = useCallback(
    debounce((newFilters) => {
      const updatedFilters = { ...newFilters };
      if (newFilters.user_name) {
        const selectedUser = users.find((user) => user.name === newFilters.user_name);
        updatedFilters.user_id = selectedUser ? selectedUser.id : "";
      } else {
        updatedFilters.user_id = "";
      }
      delete updatedFilters.user_name;
      setFilters((prev) => ({ ...prev, ...updatedFilters }));
    }, 500),
    [users]
  );

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({
      status: "",
      search: "",
      sort_by: "date",
      order: "asc",
      per_page: 15,
      user_id: "",
      pagination: 0,
    });
  }, []);

  // Filter configuration
  const filterConfig = useMemo(
    () => [
      {
        name: "type",
        label: "type",
        type: "select",
        options: [
          { value: "warning", label: t("warning") },
          { value: "commitment", label: t("commitment") },
          { value: "summon", label: t("summon") },
          { value: "termination_notice", label: t("termination_notice") },
          { value: "termination", label: t("termination") },
        ],
      },
      {
        name: "user_name",
        label: "user",
        type: "select",
        options: users.map((user) => ({ value: user.name, label: user.name })),
      },
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
      },
    ],
    [users, t]
  );

  // Fields configuration for add/edit modals
  const fieldsConfig = useMemo(
    () => [
      {
        name: "user_id",
        label: "user",
        type: "select",
        options: users.map((user) => ({ value: user.id, label: user.name })),
        required: true,
      },
      {
        name: "date",
        label: "date",
        type: "date",
        required: true,
      },
      {
        name: "type",
        label: "type",
        type: "select",
        options: [
          { value: "warning", label: t("warning") },
          { value: "commitment", label: t("commitment") },
          { value: "summon", label: t("summon") },
          { value: "termination_notice", label: t("termination_notice") },
          { value: "termination", label: t("termination") },
        ],
        required: true,
      },
      {
        name: "notes",
        label: "notes",
        type: "textarea",
        required: false,
      },
    ],
    [users, t]
  );
  const editFieldsConfig = useMemo(
    () => [
      {
        name: "type",
        label: "type",
        type: "select",
        options: [
          { value: "warning", label: t("warning") },
          { value: "commitment", label: t("commitment") },
          { value: "summon", label: t("summon") },
          { value: "termination_notice", label: t("termination_notice") },
          { value: "termination", label: t("termination") },
        ],
        required: true,
      },
      {
        name: "notes",
        label: "notes",
        type: "textarea",
        required: false,
      },
    ],
    [users, t]
  );

  const searchConfig = { field: "search", placeholder: "search_actions" };

  // Table columns
  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      {
        header: t("user"),
        accessor: "user",
        render: (row) => row.user?.name || t("not_specified"),
      },
      {
        header: t("creator"),
        accessor: "creator",
        render: (row) => row.creator?.name || t("not_specified"),
      },
      { header: t("date"), accessor: "date" },
      {
        header: t("type"),
        accessor: "type",
        render: (row) => (
          <span
            className={`px-2 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
              row.type === "warning"
                ? "bg-yellow-100 text-yellow-800"
                : row.type === "commitment"
                ? "bg-blue-100 text-blue-800"
                : row.type === "summon"
                ? "bg-purple-100 text-purple-800"
                : row.type === "termination_notice"
                ? "bg-orange-100 text-orange-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.translated_type || row.type}
          </span>
        ),
      },
      { header: t("notes"), accessor: "notes" },
      {
        header: t("created_at"),
        accessor: "created_at",
        render: (row) => row.created_at_humanly || row.created_at,
      },
      {
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={() => {
              if (row) {
                // Ensure selectedAction has all required fields
                setSelectedAction({
                  id: row.id,
                  user_id: row.user?.id || "",
                  date: row.date || "",
                  type: row.type || "",
                  notes: row.notes || "",
                });
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_action_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedAction(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_action_selected"), { autoClose: 3000 });
              }
            }}
          />
        ),
      },
    ],
    [t]
  );

  // Optimized fetch dependencies for modals
  const optimizedFetchDependencies = useMemo(
    () => ({
      user_id: async () => {
        const cachedData = queryClient.getQueryData(["users", locale]);
        if (cachedData) {
          return cachedData;
        }
        return await fetchUsers({}, locale).then((res) => res.data.data);
      },
    }),
    [locale, queryClient]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("actions")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => setIsAddModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={{
          ...filters,
          user_name: users.find((user) => user.id === filters.user_id)?.name || "",
        }}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={actions} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addActionMutation.mutate(data)}
        initialData={{ user_id: "", date: "", type: "", notes: "" }}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => updateActionMutation.mutate({ id: selectedAction.id, actionData: data })}
        initialData={{ type: selectedAction?.type || "", notes: selectedAction?.notes || "" }}
        isEdit={true}
        fieldsConfig={editFieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteActionMutation.mutate(selectedAction.id)}
        userName={selectedAction?.translated_type || selectedAction?.type || ""}
      />
    </div>
  );
};

export default ActionsPage;