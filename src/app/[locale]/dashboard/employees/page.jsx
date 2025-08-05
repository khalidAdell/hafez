"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import UserModal from "../users/UserModal";
import DeleteModal from "../../../../components/modals/DeleteModal";
import GlobalToast from "../../../../components/GlobalToast";
import { fetchUsers, addUser, updateUser, deleteUser, fetchCities, fetchDistricts } from "../../../../lib/api";
import { usePathname } from "next/navigation";
import CustomActions from '../../../../components/modals/CustomActions';

const EmployeesPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    type: "admin",
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
    type: "admin",
    gender: "male",
    status: "active",
    city_id: "",
    district_id: "",
    phone: "",
    email: "",
    name: "",
    user_img_id: "",
    password: "",
    password_confirmation: "",
  });
  const [cityId, setCityId] = useState("");

  const { data: citiesData = [], error: citiesError } = useQuery({
    queryKey: ["cities", locale],
    queryFn: () => fetchCities({}, locale).then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });
  const { data: districtsData = [], error: districtsError } = useQuery({
    queryKey: ["districts", locale],
    queryFn: () => fetchDistricts("", locale),
    staleTime: 5 * 60 * 1000,
  });
  const { data: usersResponse, error: usersError } = useQuery({
    queryKey: ["employees", filters, locale],
    queryFn: () => fetchUsers(filters, locale),
    staleTime: 1 * 60 * 1000,
  });
  const users = usersResponse?.data?.data || [];

  const addUserMutation = useMutation({
    mutationFn: (userData) => {
      userData.append("type", "admin");
      return addUser(userData, locale);
    },
    onSuccess: (data) => {
      setIsAddModalOpen(false);
      setFormData({
        type: "admin",
        gender: "male",
        status: "active",
        city_id: "",
        district_id: "",
        phone: "",
        email: "",
        name: "",
        user_img_id: "",
        password: "",
        password_confirmation: "",
      });
      queryClient.invalidateQueries(["employees", filters, locale]);
      queryClient.invalidateQueries(["employees", locale]);
      toast.success(data?.message || t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const response = err?.response?.data;
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
  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }) => {
      userData.append("type", "admin");
      return updateUser({ id, userData }, locale);
    },
    onSuccess: (data) => {
      setIsEditModalOpen(false);
      setFormData({
        type: "admin",
        gender: "male",
        status: "active",
        city_id: "",
        district_id: "",
        phone: "",
        email: "",
        name: "",
        user_img_id: "",
        password: "",
        password_confirmation: "",
      });
      queryClient.invalidateQueries(["employees", filters, locale]);
      queryClient.invalidateQueries(["employees", locale]);
      toast.success(data?.message || t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const response = err?.response?.data;
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
  const deleteUserMutation = useMutation({
    mutationFn: (id) => deleteUser(id, locale),
    onSuccess: (data) => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["employees", filters, locale]);
      queryClient.invalidateQueries(["employees", locale]);
      toast.success(data?.message || t("employee_deleted_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const response = err?.response?.data;
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

  useEffect(() => {
    if (citiesError || districtsError || usersError) {
      const errorMessage =
        citiesError?.message ||
        districtsError?.message ||
        usersError?.message ||
        t("error_loading_employees");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [citiesError, districtsError, usersError, t]);

  const columns = useMemo(() => [
    { header: 'ID', accessor: 'id' },
    { header: t("name-user"), accessor: 'name' },
    { header: t("email"), accessor: 'email' },
    { header: t("phone"), accessor: 'phone' },
    { header: t("status"), accessor: 'status' },
    {
      header: t("options"),
      accessor: 'options',
      render: (row) => (
        <CustomActions
          userId={row.id}
          onError={(err) => {
            const response = err?.response?.data;
            let errorMessage = response?.message || t("error");
            if (response?.data && typeof response.data === "object") {
              const fieldErrors = Object.entries(response.data)
                .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
                .join(" | ");
              errorMessage += ` - ${fieldErrors}`;
            }
            setError(errorMessage);
            toast.error(errorMessage, { autoClose: 5000 });
          }}
          onEdit={() => {
            if (row) {
              const newFormData = {
                ...row,
                type: "parent",
                city_id: row.city?.id ? String(row.city.id) : row.city_id ? String(row.city_id) : "",
                district_id: row.district?.id ? String(row.district.id) : row.district_id ? String(row.district_id) : "",
                user_img_id: row.user_img || "",
                profile_picture: row.profile_picture || "",
                password: "",
                password_confirmation: "",
              };
              setFormData(newFormData);
              setSelectedUser(newFormData);
              setIsEditModalOpen(true);
            } else {
              toast.error(t("no_parent_selected"), { autoClose: 3000 });
            }
          }}
          onDelete={() => {
            if (row) {
              setSelectedUser(row);
              setIsDeleteModalOpen(true);
            } else {
              toast.error(t("no_parent_selected"), { autoClose: 3000 });
            }
          }}
        />
      ),
    },
  ], [t]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("employees")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => {
          setFormData({ type: "admin", gender: "male", status: "active" });
          setIsAddModalOpen(true);
        }}
      />
      <center>
        <DashboardTable columns={columns} data={users} />
      </center>
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({ type: "admin", gender: "male", status: "active" });
        }}
        onSubmit={(data) => {
          addUserMutation.mutate(data);
        }}
        initialData={formData}
        isEdit={false}
        cities={Array.isArray(citiesData) ? citiesData : []}
        districts={Array.isArray(districtsData) ? districtsData : []}
        locale={locale}
        setCityId={setCityId}
      />
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFormData({ type: "admin", gender: "male", status: "active" });
        }}
        onSubmit={(data) => {
          updateUserMutation.mutate({ id: selectedUser.id, userData: data });
        }}
        initialData={formData}
        isEdit={true}
        cities={Array.isArray(citiesData) ? citiesData : []}
        districts={Array.isArray(districtsData) ? districtsData : []}
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

export default EmployeesPage;