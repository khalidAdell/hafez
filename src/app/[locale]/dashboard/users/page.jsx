"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/modals/CustomActions";
import UserModal from "./UserModal";
import DeleteModal from "../../../../components/modals/DeleteModal";
import GlobalToast from "../../../../components/GlobalToast";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  fetchCities,
  fetchDistricts,
  fetchStudyLevels,
  fetchSessions,
  importUsers,

} from "../../../../lib/api";
import { usePathname } from "next/navigation";

const UsersPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    status: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    city_id: "",
    district_id: "",
    gender: "",
    pagination: 0,
  });
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: "student",
    gender: "male",
    status: "active",
  });
  const [cityId, setCityId] = useState("");

  const { data: citiesData, error: citiesError } = useQuery({
    queryKey: ["cities", locale],
    queryFn: () =>
      fetchCities({}, locale).then((res) => {
        if (!res.data?.data) {
          throw new Error(t("error_fetching_cities"));
        }
        return res.data.data;
      }),
    staleTime: 5 * 60 * 1000,
  });

  const cityOptions = useMemo(() => {
    if (!Array.isArray(citiesData)) return [];
    return citiesData.map((city) => ({
      value: city.id,
      label:
        locale === "ar" ? city.name_ar || city.name : city.name_en || city.name,
    }));
  }, [citiesData, locale]);

  const { data: districtsData = [], error: districtsError } = useQuery({
    queryKey: ["districts", locale],
    queryFn: () => fetchDistricts("", locale),
    staleTime: 5 * 60 * 1000,
  });

  const districtOptions = useMemo(() => {
    return districtsData
      .filter((ele) => ele.city_id == cityId)
      .map((district) => ({
        value: district.id,
        label:
          locale === "ar"
            ? district.name_ar || district.name
            : district.name_en || district.name,
      }));
  }, [districtsData, cityId, locale]);

  const { data: studyLevels = [], error: studyLevelsError } = useQuery({
    queryKey: ["studyLevels", locale],
    queryFn: () =>
      fetchStudyLevels({}, locale).then((res) => {
        if (!res.data?.data) {
          throw new Error(t("error_fetching_study_levels"));
        }
        return res.data.data;
      }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: sessions = [], error: sessionsError } = useQuery({
    queryKey: ["sessions", locale],
    queryFn: () =>
      fetchSessions({}, locale).then((res) => {
        if (!res.data?.data) {
          throw new Error(t("error_fetching_sessions"));
        }
        return res.data.data;
      }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: parentsResponse, error: parentsError } = useQuery({
    queryKey: ["parents", locale],
    queryFn: () =>
      fetchUsers({ type: "parent", pagination: 0 }, locale).then((res) => {
        if (!res.data?.data) {
          throw new Error(t("error_fetching_parents"));
        }
        return res.data.data;
      }),
    staleTime: 5 * 60 * 1000,
  });

  const parents = parentsResponse || [];

  const { data: usersResponse, error: usersError } = useQuery({
    queryKey: ["users", filters, locale],
    queryFn: () => {
      console.log(`Fetching users with filters:`, filters);
      return fetchUsers(filters, locale);
    },
    staleTime: 1 * 60 * 1000,
  });

  const users = usersResponse?.data?.data || [];

    const importUsersMutation = useMutation({
      mutationFn: (formData) => importUsers(formData, locale),
      onSuccess: (data) => {
        setIsImportModalOpen(false);
        queryClient.invalidateQueries(["", filters, locale]);
        toast.success(data?.message || t("imported_successfully"), {
          autoClose: 3000,
        });
      },
      onError: (err) => {
        setError(err.message);
        toast.error(err.message, { autoClose: 5000 });
      },
    });
  useEffect(() => {
    if (
      citiesError ||
      districtsError ||
      studyLevelsError ||
      sessionsError ||
      parentsError ||
      usersError
    ) {
      const errorMessage =
        citiesError?.message ||
        districtsError?.message ||
        studyLevelsError?.message ||
        sessionsError?.message ||
        parentsError?.message ||
        usersError?.message ||
        t("error_loading_users");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [
    citiesError,
    districtsError,
    studyLevelsError,
    sessionsError,
    parentsError,
    usersError,
    t,
  ]);

  const handleFormChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: type === "file" ? files[0] : value,
      };
      // Reset district_id when city_id changes
      if (name === "city_id") {
        newFormData.district_id = "";
      }
      console.log("Updated formData:", newFormData); // Debug log
      return newFormData;
    });
  }, []);

  const addUserMutation = useMutation({
    mutationFn: (userData) => {
      console.log("Add user data:", [...userData.entries()]);
      return addUser(userData, locale);
    },
    onSuccess: (data) => {
      setIsAddModalOpen(false);
      setFormData({ type: "student", gender: "male", status: "active" });
      queryClient.invalidateQueries(["users", filters, locale]);
      queryClient.invalidateQueries(["parents", locale]);
      toast.success(data?.message || t("added_successfully"), {
        autoClose: 3000,
      });
    },
    onError: (err) => {
      const response = err.response?.data;
      let errorMessage = response?.message || t("error");
      if (response?.data && typeof response.data === "object") {
        const fieldErrors = Object.values(response.data).flat().join(" | ");
        errorMessage += ` - ${fieldErrors}`;
      }
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }) => {
      console.log("Update user data:", [...userData.entries()]);
      return updateUser({ id, userData }, locale);
    },
    onSuccess: (data) => {
      setIsEditModalOpen(false);
      setFormData({ type: "student", gender: "male", status: "active" });
      queryClient.invalidateQueries(["users", filters, locale]);
      queryClient.invalidateQueries(["parents", locale]);
      toast.success(data?.message || t("updated_successfully"), {
        autoClose: 3000,
      });
    },
    onError: (err) => {
      const response = err.response?.data;
      let errorMessage = response?.message || t("error");
      if (response?.data && typeof response.data === "object") {
        const fieldErrors = Object.values(response.data).flat().join(" | ");
        errorMessage += ` - ${fieldErrors}`;
      }
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => deleteUser(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["users", filters, locale]);
      queryClient.invalidateQueries(["parents", locale]);
      toast.success(t("user_deleted_successfully"), { autoClose: 3000 });
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
      const updatedFilters = { ...newFilters };
      if (newFilters.city_id) {
        updatedFilters.city_id = newFilters.city_id;
      } else {
        updatedFilters.city_id = "";
      }
      if (newFilters.district_id) {
        updatedFilters.district_id = newFilters.district_id;
      } else {
        updatedFilters.district_id = "";
      }
      console.log("Applying filters:", updatedFilters);
      setFilters((prev) => ({ ...prev, ...updatedFilters }));
    }, 500),
    []
  );

  const handleResetFilters = useCallback(() => {
    console.log("Resetting filters");
    setFilters({
      type: "",
      search: "",
      status: "",
      sort_by: "name",
      order: "asc",
      per_page: 15,
      city_id: "",
      district_id: "",
      gender: "",
      pagination: 0,
    });
  }, []);

  const filterConfig = useMemo(
    () => [
      {
        name: "type",
        label: "type",
        type: "select",
        options: [
          { value: "admin", label: t("admin") },
          { value: "teacher", label: t("teacher") },
          { value: "student", label: t("student") },
          { value: "parent", label: t("parent") },
        ],
      },
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
        name: "city_id",
        label: "city",
        type: "select",
        options: cityOptions,
      },
      {
        name: "district_id",
        label: "district",
        type: "select",
        options: Array.isArray(districtsData)
          ? districtsData.map((district) => ({
              value: district.id,
              label:
                locale === "ar"
                  ? district.name_ar || district.name
                  : district.name_en || district.name,
            }))
          : [],
      },
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
      },
    ],
    [cityOptions, districtsData, locale, t]
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
        name: "type",
        label: "type",
        type: "select",
        required: true,
        options: [
          { value: "admin", label: t("admin") },
          { value: "teacher", label: t("teacher") },
          { value: "student", label: t("student") },
          { value: "parent", label: t("parent") },
        ],
      },
      {
        name: "job",
        label: "job",
        type: "text",
        required: (formData) => formData.type === "teacher",
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
        name: "status",
        label: "status",
        type: "select",
        required: true,
        options: [
          { value: "active", label: t("active") },
          { value: "inactive", label: t("inactive") },
          { value: "pending", label: t("pending") },
        ],
      },
      {
        name: "city_id",
        label: "city",
        type: "select",
        required: (formData) => formData.type !== "admin",
        options: cityOptions,
      },
      {
        name: "district_id",
        label: "district",
        type: "select",
        required: (formData) => formData.type !== "admin",
        options: districtOptions,
      },
      {
        name: "age",
        label: "age",
        type: "date",
        required: true,
        max: new Date().toISOString().split("T")[0], // Before today
      },
      {
        name: "study_level_id",
        label: "study_level",
        type: "select",
        required: (formData) => formData.type === "student",
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
        name: "session_id",
        label: "session",
        type: "select",
        required: (formData) => formData.type === "student",
        options: Array.isArray(sessions)
          ? sessions.map((session) => ({
              value: session.id,
              label:
                locale === "ar"
                  ? session.name_ar || session.name
                  : session.name_en || session.name,
            }))
          : [],
      },
      {
        name: "parent_id",
        label: "parent",
        type: "select",
        required: (formData) => formData.type === "student",
        options: Array.isArray(parents)
          ? parents.map((parent) => ({
              value: parent.id,
              label: parent.name,
            }))
          : [],
      },
      {
        name: "user_img_id",
        label: "user_image",
        type: "image-picker",
        imageField: "user_img",
      },
    ],
    [
      cityOptions,
      districtOptions,
      studyLevels,
      sessions,
      parents,
      locale,
      t,
      isEditModalOpen,
    ]
  );

  const searchConfig = { field: "search", placeholder: "search_users" };

  const optimizedFetchDependencies = useMemo(
    () => ({
      city_id: async () => {
        const cachedData = queryClient.getQueryData(["cities", locale]);
        if (cachedData) {
          return Array.isArray(cachedData) ? cachedData : cachedData.data || [];
        }
        return await fetchCities({}, locale).then((res) => res.data.data || []);
      },
      district_id: async () => {
        const cachedData = queryClient.getQueryData(["districts", locale]);
        if (cachedData) {
          return Array.isArray(cachedData) ? cachedData : cachedData.data || [];
        }
        return await fetchDistricts("", locale).then((res) => res.data || []);
      },
      study_level_id: async () => {
        const cachedData = queryClient.getQueryData(["studyLevels", locale]);
        if (cachedData) {
          return Array.isArray(cachedData) ? cachedData : cachedData.data || [];
        }
        return await fetchStudyLevels({}, locale).then(
          (res) => res.data.data || []
        );
      },
      session_id: async () => {
        const cachedData = queryClient.getQueryData(["sessions", locale]);
        if (cachedData) {
          return Array.isArray(cachedData) ? cachedData : cachedData.data || [];
        }
        return await fetchSessions({}, locale).then(
          (res) => res.data.data || []
        );
      },
      parent_id: async () => {
        const cachedData = queryClient.getQueryData(["parents", locale]);
        if (cachedData) {
          return Array.isArray(cachedData) ? cachedData : cachedData.data || [];
        }
        return await fetchUsers({ type: "parent", pagination: 0 }, locale).then(
          (res) => res.data.data || []
        );
      },
    }),
    [locale, queryClient]
  );

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      { header: t("email"), accessor: "email" },
      { header: t("phone"), accessor: "phone" },
      { header: t("role"), accessor: "type" },
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
      {
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={() => {
              if (row) {
                const newFormData = {
                  ...row,
                  city_id: row.city?.id ? String(row.city.id) : row.city_id ? String(row.city_id) : "",
                  district_id: row.district?.id ? String(row.district.id) : row.district_id ? String(row.district_id) : "",
                  user_img_id: row.user_img || "",
                  profile_picture: row.profile_picture || "",
                };
                setFormData(newFormData);
                setSelectedUser(newFormData);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_user_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedUser(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_user_selected"), { autoClose: 3000 });
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
        pageTitle={t("users")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => {
          setFormData({ type: "student", gender: "male", status: "active" });
          setIsAddModalOpen(true);
        }}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={filters}
        fetchDependencies={{ cities: fetchCities }}
      />
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {t("import_users")}
              </button>
            </div>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={users} />
      </center>
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({ type: "student", gender: "male", status: "active" });
        }}
        onSubmit={(data) => {
          addUserMutation.mutate(data);
        }}
        initialData={formData}
        isEdit={false}
        cities={Array.isArray(citiesData) ? citiesData : []}
        districts={Array.isArray(districtsData) ? districtsData : []}
        studyLevels={Array.isArray(studyLevels) ? studyLevels : []}
        sessions={Array.isArray(sessions) ? sessions : []}
        parents={Array.isArray(parentsResponse) ? parentsResponse : []}
        locale={locale}
        setCityId={setCityId}
      />
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFormData({ type: "student", gender: "male", status: "active" });
        }}
        onSubmit={(data) => {
          updateUserMutation.mutate({ id: selectedUser.id, userData: data });
        }}
        initialData={formData}
        isEdit={true}
        cities={Array.isArray(citiesData) ? citiesData : []}
        districts={Array.isArray(districtsData) ? districtsData : []}
        studyLevels={Array.isArray(studyLevels) ? studyLevels : []}
        sessions={Array.isArray(sessions) ? sessions : []}
        parents={Array.isArray(parentsResponse) ? parentsResponse : []}
        locale={locale}
        setCityId={setCityId}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteUserMutation.mutate(selectedUser.id)}
        userName={selectedUser?.name || ""}
      />
      <ImportUsersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={(formData) => importUsersMutation.mutate(formData)}
        locale={locale}
      />
    </div>
  );
};

export default UsersPage;

import { X, Upload, FileSpreadsheet, Users } from 'lucide-react';

const ImportUsersModal = ({ isOpen, onClose, onSubmit, locale }) => {
  const t = useTranslations();
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState("student");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    console.log("Selected file:", selectedFile ? selectedFile.name : "No file selected");
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      console.log("Dropped file:", droppedFile.name);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!file) {
      toast.error(t("no_file_selected"), { autoClose: 3000 });
      return;
    }
    const formData = new FormData();
    formData.append("type", uploadType);
    formData.append("file", file);
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value.name || value}`);
    }
    onSubmit(formData);
  }, [file, uploadType, onSubmit, t]);

  const userTypeOptions = [
    { value: "student", label: t("student"), icon: Users },
    { value: "teacher", label: t("teacher"), icon: Users },
    { value: "parent", label: t("parent"), icon: Users }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{t("import_users")}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("upload_excel_file")}
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">{file.name}</p>
                      <p className="text-xs text-green-600">Ready to upload</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Drop your Excel file here or click to browse
                      </p>
                      <p className="text-xs text-gray-500">Supports .xlsx and .xls files</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("user_type")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {userTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`relative flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      uploadType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="uploadType"
                      value={option.value}
                      checked={uploadType === option.value}
                      onChange={(e) => setUploadType(e.target.value)}
                      className="sr-only"
                    />
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!file}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {t("upload")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};