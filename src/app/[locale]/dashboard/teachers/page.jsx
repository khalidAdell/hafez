"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/modals/CustomActions";
import GenericModal from "../../../../components/modals/GenericModal";
import DeleteModal from "../../../../components/modals/DeleteModal";
import GlobalToast from "../../../../components/GlobalToast";
import { fetchUsers, addUser, updateUser, deleteUser, fetchCities, fetchDistricts } from "../../../../lib/api";
import { usePathname } from "next/navigation";

const TeachersPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
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
    pagination: 1,
  });

  // جلب المدن
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ["cities", locale],
    queryFn: () => fetchCities(locale),
    staleTime: Infinity,
  });

  // جلب الأحياء بناءً على city_id
  const { data: districts, isLoading: districtsLoading } = useQuery({
    queryKey: ["districts", filters.city_id, locale],
    queryFn: () => fetchDistricts(filters.city_id, locale),
    enabled: !!filters.city_id,
    staleTime: Infinity,
  });

  // جلب المعلمين
  const { data: response, error, isLoading } = useQuery({
    queryKey: ["teachers", filters, locale],
    queryFn: () => fetchUsers({ ...filters, locale }),
    staleTime: 5 * 60 * 1000,
  });

  const teachers = response?.data || [];
  const paginationMeta = response?.meta || {};
  const paginationLinks = response?.links || {};

  const handleSearch = debounce((searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, pagination: 1 }));
  }, 500);

  const handleFilter = (newFilters) => {
    const updatedFilters = { ...newFilters, type: "teacher", pagination: 1 };
    if (newFilters.city_name) {
      const selectedCity = cities?.find((city) => city.name === newFilters.city_name);
      updatedFilters.city_id = selectedCity ? selectedCity.id : "";
    } else {
      updatedFilters.city_id = "";
    }
    if (newFilters.district_name) {
      const selectedDistrict = districts?.find((district) => district.name === newFilters.district_name);
      updatedFilters.district_id = selectedDistrict ? selectedDistrict.id : "";
    } else {
      updatedFilters.district_id = "";
    }
    delete updatedFilters.city_name;
    delete updatedFilters.district_name;
    setFilters((prev) => ({ ...prev, ...updatedFilters }));
  };

  const handleResetFilters = () => {
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
      pagination: 1,
    });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, pagination: page }));
  };

  const handleAddTeacher = async (teacherData) => {
    try {
      await addUser({ ...teacherData, type: "teacher" }, locale);
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["teachers"]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("error");
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const handleEditTeacher = async (teacherData) => {
    if (!selectedTeacher?.id) {
      toast.error(t("no_teacher_selected"), { autoClose: 3000 });
      return;
    }
    try {
      await updateUser(selectedTeacher.id, { ...teacherData, type: "teacher" }, locale);
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["teachers"]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("error");
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher?.id) {
      toast.error(t("no_teacher_selected"), { autoClose: 3000 });
      return;
    }
    try {
      await deleteUser(selectedTeacher.id, locale);
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["teachers"]);
      toast.success(t("teacher_deleted_successfully"), { autoClose: 3000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("error");
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const filterConfig = [
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
      name: "gender",
      label: "gender",
      type: "select",
      options: [
        { value: "male", label: "male" },
        { value: "female", label: "female" },
      ],
    },
    {
      name: "city_name",
      label: "city",
      type: "select",
      options: cities?.map((city) => ({ value: city.name, label: city.name })) || [],
    },
    {
      name: "district_name",
      label: "district",
      type: "select",
      options: districts?.map((district) => ({ value: district.name, label: district.name })) || [],
    },
    {
      name: "pagination",
      label: "pagination",
      type: "number",
      min: 1,
    },
  ];

  const fieldsConfig = [
    { name: "name", label: "name", type: "text", required: true },
    { name: "email", label: "email", type: "email", required: true },
    { name: "phone", label: "phone", type: "text" },
    {
      name: "gender",
      label: "gender",
      type: "select",
      options: [
        { value: "male", label: "male" },
        { value: "female", label: "female" },
      ],
    },
    {
      name: "city_id",
      label: "city",
      type: "select",
      options: cities?.map((city) => ({ value: city.id, label: city.name })) || [],
    },
    {
      name: "district_id",
      label: "district",
      type: "select",
      dependsOn: "city_id",
      options: districts?.map((district) => ({ value: district.id, label: district.name })) || [],
    },
    { name: "user_img", label: "user_image", type: "file" },
  ];

  const searchConfig = { field: "search", placeholder: "search_teachers" };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: t("name"), accessor: "name" },
    { header: t("email"), accessor: "email" },
    { header: t("phone"), accessor: "phone" },
    {
      header: t("status"),
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-sm leading-5 font-medium rounded-full
            ${row.status === "active" || row.status === "نشط" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
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
              setSelectedTeacher(row);
              setIsEditModalOpen(true);
            } else {
              toast.error(t("no_teacher_selected"), { autoClose: 3000 });
            }
          }}
          onDelete={() => {
            if (row) {
              setSelectedTeacher(row);
              setIsDeleteModalOpen(true);
            } else {
              toast.error(t("no_teacher_selected"), { autoClose: 3000 });
            }
          }}
        />
      ),
    },
  ];

  if (isLoading || citiesLoading || districtsLoading) {
    return <p className="text-center text-gray-600">{t("loading")}</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center mb-4">{error.message || t("error_loading_teachers")}</p>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("teachers")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => setIsAddModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={{
          ...filters,
          city_name: cities?.find((city) => city.id === filters.city_id)?.name || "",
          district_name: districts?.find((district) => district.id === filters.district_id)?.name || "",
        }}
      />
      <center>
        <DashboardTable columns={columns} data={teachers} />
        {paginationMeta && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => handlePageChange(filters.pagination - 1)}
              disabled={!paginationLinks.prev}
              className="px-4 py-2 bg-[#0B7459] text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {t("previous")}
            </button>
            <span className="px-4 py-2 text-gray-600">
              {t("page")} {paginationMeta.current_page} {t("of")} {paginationMeta.last_page}
            </span>
            <button
              onClick={() => handlePageChange(filters.pagination + 1)}
              disabled={!paginationLinks.next}
              className="px-4 py-2 bg-[#0B7459] text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {t("next")}
            </button>
          </div>
        )}
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTeacher}
        initialData={{ gender: "male" }}
        fieldsConfig={fieldsConfig}
        fetchDependencies={{ city_id: () => fetchCities(locale), district_id: (cityId) => fetchDistricts(cityId, locale) }}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditTeacher}
        initialData={selectedTeacher || {}}
        isEdit={true}
        fieldsConfig={fieldsConfig}
        fetchDependencies={{ city_id: () => fetchCities(locale), district_id: (cityId) => fetchDistricts(cityId, locale) }}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTeacher}
        userName={selectedTeacher?.name || ""}
      />
    </div>
  );
};

export default TeachersPage;