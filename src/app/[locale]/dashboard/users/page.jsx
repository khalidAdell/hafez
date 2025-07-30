"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/modals/CustomActions";
import GenericModal from "../../../../components/modals/GenericModal";
import DeleteModal from "../../../../components/modals/DeleteModal";
import GlobalToast from "../../../../components/GlobalToast";
import { fetchUsers, addUser, updateUser, deleteUser, fetchCities, fetchDistricts } from "../../../../lib/api";
import { usePathname } from "next/navigation";

const UsersPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // تحميل المدن
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await fetchCities(locale);
        setCities(citiesData);
      } catch (err) {
        setError(err.message);
        toast.error(err.message, { autoClose: 3000 });
      }
    };
    loadCities();
  }, [locale]);

useEffect(() => {
  const loadDistricts = async () => {
    if (!filters.city_id) {
      setDistricts([]);
      return;
    }
    try {
      const districtsData = await fetchDistricts(filters.city_id, locale);
      setDistricts(districtsData);
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { autoClose: 3000 });
    }
  };
  loadDistricts();
}, [filters.city_id, locale]);

  // تحميل المستخدمين على حسب الفلاتر
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchUsers(filters, locale);
        setUsers(response.data);
        setError(null);
      } catch (err) {
        const errorMessage = err.response?.data?.message || t("error_loading_users");
        setError(errorMessage);
      }
    };
    loadUsers();
  }, [filters, locale, t]);

  // إضافة مستخدم جديد
  const handleAddUser = async (userData) => {
    try {
      await addUser(userData, locale);
      setIsAddModalOpen(false);
      const response = await fetchUsers(filters, locale);
      setUsers(response.data);
      toast.success(t("user_added_successfully"), { autoClose: 3000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("error_adding_user");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  // تعديل مستخدم
  const handleEditUser = async (userData) => {
    if (!selectedUser?.id) {
      toast.error(t("no_user_selected"), { autoClose: 3000 });
      return;
    }
    try {
      await updateUser(selectedUser.id, userData, locale);
      setIsEditModalOpen(false);
      const response = await fetchUsers(filters, locale);
      setUsers(response.data);
      toast.success(t("user_updated_successfully"), { autoClose: 3000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("error_updating_user");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  // حذف مستخدم
  const handleDeleteUser = async () => {
    if (!selectedUser?.id) {
      toast.error(t("no_user_selected"), { autoClose: 3000 });
      return;
    }
    try {
      await deleteUser(selectedUser.id, locale);
      setIsDeleteModalOpen(false);
      const response = await fetchUsers(filters, locale);
      setUsers(response.data);
      toast.success(t("user_deleted_successfully"), { autoClose: 3000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || t("error_deleting_user");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  // البحث
  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  // تطبيق الفلاتر
  const handleFilter = (newFilters) => {
    const updatedFilters = { ...newFilters };

    // نستخدم id وليس الاسم للأماكن
    updatedFilters.city_id = newFilters.city_name || "";
    updatedFilters.district_id = newFilters.district_name || "";

    delete updatedFilters.city_name;
    delete updatedFilters.district_name;

    setFilters((prev) => ({ ...prev, ...updatedFilters }));
  };

  // إعادة تعيين الفلاتر
  const handleResetFilters = () => {
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
  };

  // تكوين خيارات الفلتر مع عرض أسماء المدن والأحياء حسب اللغة
  const filterConfig = [
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
      name: "city_name",
      label: "city",
      type: "select",
      options: cities.map((city) => ({
        value: city.id,
        label: locale === "ar" ? city.name_ar || city.name : city.name_en || city.name,
      })),
    },
    {
      name: "district_name",
      label: "district",
      type: "select",
      options: districts.map((district) => ({
        value: district.id,
        label: locale === "ar" ? district.name_ar || district.name : district.name_en || district.name,
      })),
    },
    {
      name: "pagination",
      label: "pagination",
      type: "number",
      min: 0,
    },
  ];

  const fieldsConfig = [
    { name: "name", label: "name", type: "text", required: true },
    { name: "email", label: "email", type: "email", required: true },
    { name: "phone", label: "phone", type: "text" },
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
      options: cities.map((city) => ({
        value: city.id,
        label: locale === "ar" ? city.name_ar || city.name : city.name_en || city.name,
      })),
    },
    {
      name: "district_id",
      label: "district",
      type: "select",
      dependsOn: "city_id",
      options: districts.map((district) => ({
        value: district.id,
        label: locale === "ar" ? district.name_ar || district.name : district.name_en || district.name,
      })),
    },
    { name: "user_img", label: "user_image", type: "file" },
  ];

  const searchConfig = { field: "search", placeholder: "search_users" };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: t("name"), accessor: "name" },
    { header: t("email"), accessor: "email" },
    { header: t("phone"), accessor: "phone" },
    { header: t("role"), accessor: "type" },
    { header: t("status"), accessor: "status" },
    {
      header: t("options"),
      accessor: "options",
      render: (row) => (
        <CustomActions
          userId={row.id}
          onEdit={() => {
            if (row) {
              setSelectedUser(row);
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
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("users")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => setIsAddModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={{
          ...filters,
          city_name: filters.city_id,
          district_name: filters.district_id,
        }}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={users} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
        initialData={{ type: "student", gender: "male" }}
        fieldsConfig={fieldsConfig}
        fetchDependencies={{ city_id: fetchCities, district_id: fetchDistricts }}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditUser}
        initialData={selectedUser || {}}
        isEdit={true}
        fieldsConfig={fieldsConfig}
        fetchDependencies={{ city_id: fetchCities, district_id: fetchDistricts }}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        userName={selectedUser?.name || ""}
      />
    </div>
  );
};

export default UsersPage;
