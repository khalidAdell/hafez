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

import {
  fetchDistricts,
  addDistrict,
  updateDistrict,
  deleteDistrict,
  fetchDistrictById,
  fetchCities,
} from "../../../../lib/api";

import { usePathname } from "next/navigation";

const DistrictsPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sort_by: "name",
    order: "asc",
    per_page: 10,
    pagination: 1,
    city_id: "",
  });
  const [error, setError] = useState(null);

  const { data: citiesData } = useQuery({
    queryKey: ["cities", locale],
    queryFn: () => fetchCities({}, locale),
    staleTime: 5 * 60 * 1000,
  });

  const cityOptions = useMemo(() => {
    if (!citiesData?.data?.data) return [];
    return citiesData.data.data.map((city) => ({
      value: city.id,
      label: city.name || city.name_ar || city.name_en,
    }));
  }, [citiesData]);

  const { data: districts = [], error: districtsError } = useQuery({
    queryKey: ["districts", filters.city_id, locale],
    queryFn: () => fetchDistricts(filters.city_id, locale),
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (districtsError) {
      const errorMessage = districtsError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else if (!districts || districts.length === 0) {
      setError(t("no_data_available"));
    } else {
      setError(null);
    }
  }, [districtsError, districts, t]);

  const addDistrictMutation = useMutation({
    mutationFn: (districtData) => addDistrict(districtData, locale),
    onSuccess: (data) => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["districts", filters.city_id, locale]);
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

  const updateDistrictMutation = useMutation({
    mutationFn: ({ id, districtData }) =>
      updateDistrict(id, districtData, locale),
    onSuccess: (data) => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["districts", filters.city_id, locale]);
      toast.success(data?.message || t("district_updated_successfully"), {
        autoClose: 3000,
      });
    },
    onError: (err) => {
      const response = err.response?.data;
      let errorMessage = response?.message || t("error_updating_district");

      if (response?.data && typeof response.data === "object") {
        const fieldErrors = Object.values(response.data).flat().join(" | ");
        errorMessage += ` - ${fieldErrors}`;
      }

      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    },
  });

  const deleteDistrictMutation = useMutation({
    mutationFn: (id) => deleteDistrict(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["districts", filters.city_id, locale]);
      toast.success(t("deleted_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const handleEditClick = async (districtId) => {
    try {
      const districtData = await fetchDistrictById(districtId, locale);
      setSelectedDistrict({
        id: districtData.id,
        name_ar: districtData.name_ar,
        name_en: districtData.name_en,
        status: districtData.status,
        city_id: districtData.city_id,
      });
      setIsEditModalOpen(true);
    } catch (error) {
      toast.error(t("error"), { autoClose: 3000 });
    }
  };

  const handleSearch = useCallback(
    debounce((searchTerm) => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500),
    []
  );

  const handleFilter = useCallback(
    debounce((newFilters) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    }, 500),
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "",
      sort_by: "name",
      order: "asc",
      per_page: 10,
      pagination: 1,
      city_id: "",
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
        name: "search",
        label: "search",
        type: "text",
      },
      {
        name: "sort_by",
        label: "sort_by",
        type: "select",
        options: [
          { value: "name", label: "name" },
          { value: "created_at", label: "created_at" },
        ],
      },
      {
        name: "order",
        label: "order",
        type: "select",
        options: [
          { value: "asc", label: "ascending" },
          { value: "desc", label: "descending" },
        ],
      },
      {
        name: "per_page",
        label: "per_page",
        type: "number",
        min: 1,
      },
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 1,
      },
      {
        name: "city_id",
        label: "city",
        type: "select",
        options: cityOptions,
      },
    ],
    [cityOptions]
  );

  const fieldsConfig = useMemo(
    () => [
      { name: "name_ar", label: "name_ar", type: "text", required: true },
      { name: "name_en", label: "name_en", type: "text", required: true },
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
      {
        name: "city_id",
        label: "city",
        type: "select",
        options: cityOptions,
        required: true,
      },
    ],
    [cityOptions]
  );

  const searchConfig = { field: "search", placeholder: "search_districts" };

  // إعداد الأعمدة في الجدول
  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      {
        header: t("city"),
        accessor: "city.name",
        render: (row) => row.city?.name || t("no_city"),
      },
      {
        header: t("status"),
        accessor: "status",
        render: (row) => (
          <span
            className={`px-2 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
              row.status === "active" || row.status === "نشط"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
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
            onEdit={() => handleEditClick(row.id)}
            onDelete={() => {
              setSelectedDistrict(row);
              setIsDeleteModalOpen(true);
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
        pageTitle={t("districts")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => setIsAddModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={filters}
        fetchDependencies={{ cities: fetchCities }}
      />

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <DashboardTable columns={columns} data={districts} />

      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addDistrictMutation.mutate(data)}
        initialData={{ status: "active", city_id: "" }}
        fieldsConfig={fieldsConfig}
        fetchDependencies={{}}
        locale={locale}
      />

      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) =>
          updateDistrictMutation.mutate({
            id: selectedDistrict.id,
            districtData: data,
          })
        }
        initialData={{
          name_ar: selectedDistrict?.name_ar || "",
          name_en: selectedDistrict?.name_en || "",
          status: selectedDistrict?.status || "active",
          city_id: selectedDistrict?.city_id || "",
        }}
        isEdit={true}
        fieldsConfig={fieldsConfig}
        fetchDependencies={{}}
        locale={locale}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteDistrictMutation.mutate(selectedDistrict.id)}
        userName={selectedDistrict?.name || ""}
      />
    </div>
  );
};

export default DistrictsPage;
