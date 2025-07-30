// src/app/[locale]/dashboard/charties/page.jsx
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
import { fetchAssociations, addAssociation, updateAssociation, deleteAssociation, fetchCities, fetchDistricts } from "../../../../lib/api";
import { usePathname } from "next/navigation";

const ChartiesPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [filters, setFilters] = useState({
    status: "active",
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    city_id: "",
    district_id: "",
    pagination: 0,
  });
  const [error, setError] = useState(null);

  // جلب المدن
  const { data: cities = [], error: citiesError } = useQuery({
    queryKey: ["cities", locale],
    queryFn: () => {
      console.log(`Fetching cities for locale: ${locale}`);
      return fetchCities(locale);
    },
    staleTime: 5 * 60 * 1000,
  });

  // جلب الأحياء بناءً على city_id
  const { data: districts = [], error: districtsError } = useQuery({
    queryKey: ["districts", filters.city_id, locale],
    queryFn: () => {
      console.log(`Fetching districts for city_id: ${filters.city_id}, locale: ${locale}`);
      return fetchDistricts(filters.city_id, locale);
    },
    enabled: !!filters.city_id,
    staleTime: 5 * 60 * 1000,
  });

  // جلب الجمعيات
  const { data: associations = [], error: associationsError } = useQuery({
    queryKey: ["associations", filters, locale],
    queryFn: () => {
      console.log(`Fetching associations with filters:`, filters);
      return fetchAssociations(filters, locale).then((res) => res.data.data);
    },
    staleTime: 1 * 60 * 1000,
  });

  // إدارة الأخطاء
  useEffect(() => {
    if (citiesError || districtsError || associationsError) {
      const errorMessage =
        citiesError?.message ||
        districtsError?.message ||
        associationsError?.message ||
        t("error_loading_data");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [citiesError, districtsError, associationsError, t]);

  // إضافة جمعية
  const addAssociationMutation = useMutation({
    mutationFn: (associationData) => addAssociation(associationData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["associations", filters, locale]);
      toast.success(t("association_added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error_adding_association");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // تعديل جمعية
  const updateAssociationMutation = useMutation({
    mutationFn: ({ id, associationData }) => updateAssociation(id, associationData, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["associations", filters, locale]);
      toast.success(t("association_updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error_updating_association");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // حذف جمعية
  const deleteAssociationMutation = useMutation({
    mutationFn: (id) => deleteAssociation(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["associations", filters, locale]);
      toast.success(t("association_deleted_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error_deleting_association");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  // التعامل مع السيرش
  const handleSearch = useCallback(
    debounce((searchTerm) => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500),
    []
  );

  // التعامل مع الفلاتر
  const handleFilter = useCallback(
    debounce((newFilters) => {
      console.log("Applying filters:", newFilters);
      const updatedFilters = { ...newFilters };
      if (newFilters.city_name) {
        const selectedCity = cities.find((city) => city.name === newFilters.city_name);
        updatedFilters.city_id = selectedCity ? selectedCity.id : "";
      } else {
        updatedFilters.city_id = "";
      }
      if (newFilters.district_name) {
        const selectedDistrict = districts.find((district) => district.name === newFilters.district_name);
        updatedFilters.district_id = selectedDistrict ? selectedDistrict.id : "";
      } else {
        updatedFilters.district_id = "";
      }
      delete updatedFilters.city_name;
      delete updatedFilters.district_name;
      setFilters((prev) => ({ ...prev, ...updatedFilters }));
    }, 500),
    [cities, districts]
  );

  // إعادة ضبط الفلاتر
  const handleResetFilters = useCallback(() => {
    console.log("Resetting filters");
    setFilters({
      status: "active",
      search: "",
      sort_by: "name",
      order: "asc",
      per_page: 15,
      city_id: "",
      district_id: "",
      pagination: 0,
    });
  }, []);

  // إعدادات الفلاتر
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
        name: "city_name",
        label: "city",
        type: "select",
        options: cities.map((city) => ({ value: city.name, label: city.name })),
      },
      {
        name: "district_name",
        label: "district",
        type: "select",
        options: districts.map((district) => ({ value: district.name, label: district.name })),
      },
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
      },
    ],
    [cities, districts]
  );

  // إعدادات الحقول للإضافة والتعديل
  const fieldsConfig = useMemo(
    () => [
      { name: "name_ar", label: "name_ar", type: "text", required: true },
      { name: "name_en", label: "name_en", type: "text", required: true },
      { name: "auth_image", label: "auth_image", type: "text", required: true },
      { name: "auth_number", label: "auth_number", type: "text", required: true },
      {
        name: "status",
        label: "status",
        type: "select",
        options: [
          { value: "active", label: "active" },
          { value: "inactive", label: "inactive" },
        ],
      },
      { name: "logo", label: "logo", type: "text", required: true },
      {
        name: "city_id",
        label: "city",
        type: "select",
        options: cities.map((city) => ({ value: city.id, label: city.name })),
      },
      {
        name: "district_id",
        label: "district",
        type: "select",
        dependsOn: "city_id",
        options: districts.map((district) => ({ value: district.id, label: district.name })),
      },
    ],
    [cities, districts]
  );

  // إعدادات السيرش
  const searchConfig = { field: "search", placeholder: "search_associations" };

  // إعدادات الأعمدة للجدول
  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      {
        header: t("city"),
        accessor: "city_id",
        render: (row) => cities.find((city) => city.id === row.city_id)?.name || "غير محدد",
      },
      {
        header: t("district"),
        accessor: "district_id",
        render: (row) => districts.find((district) => district.id === row.district_id)?.name || "غير محدد",
      },
      {
        header: t("Permitnumber"),
        accessor: "auth",
        render: (row) => row.auth?.number || "غير محدد",
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
                setSelectedAssociation(row);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_association_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedAssociation(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_association_selected"), { autoClose: 3000 });
              }
            }}
          />
        ),
      },
    ],
    [t, cities, districts]
  );

  // تحسين fetchDependencies لاستخدام الكاش
  const optimizedFetchDependencies = useMemo(
    () => ({
      city_id: async () => {
        const cachedData = queryClient.getQueryData(["cities", locale]);
        if (cachedData) {
          console.log("Using cached cities data");
          return cachedData;
        }
        console.log("Fetching cities for modal");
        return await fetchCities(locale);
      },
      district_id: async (cityId) => {
        if (!cityId) {
          console.log("No cityId provided, returning empty districts");
          return [];
        }
        const cachedData = queryClient.getQueryData(["districts", cityId, locale]);
        if (cachedData) {
          console.log(`Using cached districts data for cityId: ${cityId}`);
          return cachedData;
        }
        console.log(`Fetching districts for cityId: ${cityId}`);
        return await fetchDistricts(cityId, locale);
      },
    }),
    [locale, queryClient]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("charties")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => setIsAddModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={{
          ...filters,
          city_name: cities.find((city) => city.id === filters.city_id)?.name || "",
          district_name: districts.find((district) => district.id === filters.district_id)?.name || "",
        }}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={associations} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addAssociationMutation.mutate(data)}
        initialData={{ status: "active" }}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => updateAssociationMutation.mutate({ id: selectedAssociation.id, associationData: data })}
        initialData={selectedAssociation || {}}
        isEdit={true}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteAssociationMutation.mutate(selectedAssociation.id)}
        userName={selectedAssociation?.name || ""}
      />
    </div>
  );
};

export default ChartiesPage;