"use client";
// pages/TeachersPage.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/modals/CustomActions";
import UserModal from "../users/UserModal";
import DeleteModal from "../../../../components/modals/DeleteModal";
import GlobalToast from "../../../../components/GlobalToast";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  fetchCities,
  fetchDistricts,
} from "../../../../lib/api";
import { usePathname } from "next/navigation";

const TeachersPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    type: "teacher",
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
    type: "teacher",
    gender: "male",
    status: "active",
    job: "",
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

  const { data: usersResponse, error: usersError } = useQuery({
    queryKey: ["teachers", filters, locale],
    queryFn: () => {
      return fetchUsers({ ...filters, type: "teacher" }, locale);
    },
    staleTime: 1 * 60 * 1000,
  });

  const users = usersResponse?.data?.data || [];

  useEffect(() => {
    if (citiesError || districtsError || usersError) {
      const errorMessage =
        citiesError?.message ||
        districtsError?.message ||
        usersError?.message ||
        t("error_loading_teachers");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [citiesError, districtsError, usersError, t]);



  const handleFormChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: type === "file" ? files[0] : value,
      };
      if (name === "city_id") {
        newFormData.district_id = "";
      }
      return newFormData;
    });
  }, []);

  const addUserMutation = useMutation({
    mutationFn: (userData) => {
      userData.append("type", "teacher");
      return addUser(userData, locale);
    },
    onSuccess: (data) => {
      setIsAddModalOpen(false);
      setFormData({
        type: "teacher",
        gender: "male",
        status: "active",
        job: "",
      });
      queryClient.invalidateQueries(["teachers", filters, locale]);
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
      userData.append("type", "teacher");
      return updateUser({ id, userData }, locale);
    },
    onSuccess: (data) => {
      setIsEditModalOpen(false);
      setFormData({
        type: "teacher",
        gender: "male",
        status: "active",
        job: "",
      });
      queryClient.invalidateQueries(["teachers", filters, locale]);
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
      queryClient.invalidateQueries(["teachers", filters, locale]);
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
      const updatedFilters = { ...newFilters, type: "teacher" };
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
      setFilters((prev) => ({ ...prev, ...updatedFilters }));
    }, 500),
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      type: "teacher",
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
        name: "job",
        label: "job",
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
        required: true,
        options: cityOptions,
      },
      {
        name: "district_id",
        label: "district",
        type: "select",
        required: true,
        options: districtOptions,
      },
      {
        name: "age",
        label: "age",
        type: "date",
        required: true,
        max: new Date().toISOString().split("T")[0],
      },
      ...(!isEditModalOpen
        ? [
            {
              name: "password",
              label: "password",
              type: "password",
              required: true,
              minLength: 6,
              maxLength: 255,
            },
            {
              name: "password_confirmation",
              label: "confirm_password",
              type: "password",
              required: true,
              minLength: 6,
              maxLength: 255,
            },
          ]
        : []),
      {
        name: "user_img_id",
        label: "user_image",
        type: "image-picker",
        imageField: "user_img",
      },
    ],
    [cityOptions, districtOptions, locale, t, isEditModalOpen]
  );

  const searchConfig = { field: "search", placeholder: "search_teachers" };

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
    }),
    [locale, queryClient]
  );

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      { header: t("email"), accessor: "email" },
      { header: t("phone"), accessor: "phone" },
      { header: t("job"), accessor: "job" },
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
                  type: "teacher",
                };
                setFormData(newFormData);
                setSelectedUser(newFormData);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_teacher_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedUser(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_teacher_selected"), { autoClose: 3000 });
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
        pageTitle={t("teachers")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => {
          setFormData({
            type: "teacher",
            gender: "male",
            status: "active",
            job: "",
          });
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
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={users} />
      </center>
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({
            type: "teacher",
            gender: "male",
            status: "active",
            job: "",
          });
        }}
        onSubmit={(data) => {
          data.append("type", "teacher");
          addUserMutation.mutate(data);
        }}
        initialData={formData}
        isEdit={false}
        cities={Array.isArray(citiesData) ? citiesData : []}
        districts={Array.isArray(districtsData) ? districtsData : []}
        studyLevels={[]}
        sessions={[]}
        parents={[]}
        locale={locale}
        setCityId={setCityId}
      />
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFormData({
            type: "teacher",
            gender: "male",
            status: "active",
            job: "",
          });
        }}
        onSubmit={(data) => {
          data.append("type", "teacher");
          updateUserMutation.mutate({ id: selectedUser.id, userData: data });
        }}
        initialData={formData}
        isEdit={true}
        cities={Array.isArray(citiesData) ? citiesData : []}
        districts={Array.isArray(districtsData) ? districtsData : []}
        studyLevels={[]}
        sessions={[]}
        parents={[]}
        locale={locale}
        setCityId={setCityId}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteUserMutation.mutate(selectedUser.id)}
        userName={selectedUser?.name || ""}
      />
    </div>
  );
};

export default TeachersPage;


