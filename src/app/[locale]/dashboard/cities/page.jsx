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
  fetchCities,
  addCity,
  updateCity,
  deleteCity,
  fetchCityById,
} from "../../../../lib/api";
import { usePathname } from "next/navigation";

const CitiesPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sort_by: "name",
    order: "asc",
    per_page: 10,
    pagination: 1,
  });
  const [error, setError] = useState(null);

  const { data: cities = [], error: citiesError } = useQuery({
    queryKey: ["cities", filters, locale],
    queryFn: () => fetchCities(filters, locale).then((res) => res.data.data),
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (citiesError) {
      const errorMessage = citiesError?.message || t("error_loading_data");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else if (!cities || cities === undefined) {
      setError(t("no_data_available"));
      toast.error(t("no_data_available"), { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [citiesError, cities, t]);

  const addCityMutation = useMutation({
    mutationFn: (cityData) => addCity(cityData, locale),
    onSuccess: (data) => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["cities", filters, locale]);
      toast.success(data?.message || t("city_added_successfully"), {
        autoClose: 3000,
      });
    },
  onError: (err) => {
  const response = err.response?.data;
  const defaultMessage = t("error_adding_city"); 
  let errorMessage = response?.message || defaultMessage;

  if (response?.data && typeof response.data === "object") {
    const fieldErrors = Object.values(response.data)
      .flat()
      .join(" | "); 
    errorMessage += ` - ${fieldErrors}`;
  }

  setError(errorMessage);
  toast.error(errorMessage, { autoClose: 5000 });
},

  });

  const updateCityMutation = useMutation({
    mutationFn: ({ id, cityData }) => updateCity(id, cityData, locale),
    onSuccess: (data) => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["cities", filters, locale]);
      toast.success(data?.message || t("city_updated_successfully"), {
        autoClose: 3000,
      });
    },
   onError: (err) => {
  const response = err.response?.data;
  const defaultMessage = t("error_adding_city"); 
  let errorMessage = response?.message || defaultMessage;

  if (response?.data && typeof response.data === "object") {
    const fieldErrors = Object.values(response.data)
      .flat()
      .join(" | "); 
    errorMessage += ` - ${fieldErrors}`;
  }

  setError(errorMessage);
  toast.error(errorMessage, { autoClose: 5000 });
},

  });

  const deleteCityMutation = useMutation({
    mutationFn: (id) => deleteCity(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["cities", filters, locale]);
      toast.success(t("city_deleted_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || t("error_deleting_city");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const handleEditClick = async (cityId) => {
    try {
      const cityData = await fetchCityById(cityId, locale);
      setSelectedCity({
        id: cityData.id,
        name_ar: cityData.name_ar,
        name_en: cityData.name_en,
        status: cityData.status,
        image_id: cityData.image,
        image_url: cityData.image_url,
      });
      setIsEditModalOpen(true);
    } catch (error) {
      toast.error(t("error_loading_city_data"), { autoClose: 3000 });
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
    ],
    []
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
        name: "image",
        label: "image",
        type: "image-picker",
        required: true,
      },
    ],
    []
  );

  const searchConfig = { field: "search", placeholder: "search_cities" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
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
        header: t("image"),
        accessor: "image_url",
        render: (row) =>
          row.image_url ? (
            <img
              src={row.image_url}
              alt={row.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            t("no_image")
          ),
      },
      {
        header: t("created_at"),
        accessor: "created_at_human",
      },
      {
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={() => handleEditClick(row.id)}
            onDelete={() => {
              setSelectedCity(row);
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
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("cities")}
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
      <div className="">
        <DashboardTable columns={columns} data={cities} />
      </div>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addCityMutation.mutate(data)}
        initialData={{ status: "active" }}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) =>
          updateCityMutation.mutate({ id: selectedCity.id, cityData: data })
        }
        initialData={{
          name_ar: selectedCity?.name_ar || "",
          name_en: selectedCity?.name_en || "",
          status: selectedCity?.status || "active",
          image_id: selectedCity?.image_id || "",
          image_url: selectedCity?.image_url || "",
        }}
        isEdit={true}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteCityMutation.mutate(selectedCity.id)}
        userName={selectedCity?.name || ""}
      />
    </div>
  );
};

export default CitiesPage;
