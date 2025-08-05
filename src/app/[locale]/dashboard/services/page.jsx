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
import { fetchServices, addService, updateService, deleteService, fetchServiceById } from "../../../../lib/api";
import { usePathname } from "next/navigation";

const ServicePage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: services = [], error: servicesError } = useQuery({
    queryKey: ["services", filters, locale],
    queryFn: () => fetchServices(filters, locale).then((res) => res.data.data),
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (servicesError) {
      const errorMessage = servicesError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [servicesError, t]);

  const addServiceMutation = useMutation({
    mutationFn: (serviceData) => addService(serviceData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["services", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, serviceData }) => updateService(id, serviceData, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["services", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => deleteService(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["services", filters, locale]);
      toast.success(t("service_deleted_successfully"), { autoClose: 3000 });
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
      setFilters((prev) => ({ ...prev, ...newFilters }));
    }, 500),
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: "",
      sort_by: "name",
      order: "asc",
      per_page: 15,
      pagination: 0,
    });
  }, []);

  const filterConfig = useMemo(
    () => [
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
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
    [t]
  );

  const fieldsConfig = useMemo(
    () => [
      { name: "name_ar", label: "name_ar", type: "text", required: true },
      { name: "name_en", label: "name_en", type: "text", required: true },
      { name: "content_ar", label: "content_ar", type: "richtext", required: false },
      { name: "content_en", label: "content_en", type: "richtext", required: false },
      {
        name: "status",
        label: "status",
        type: "select",
        options: [
          { value: "active", label: t("active") },
          { value: "inactive", label: t("inactive") },
        ],
        required: true,
      },
      { name: "image", label: "image", type: "image-picker", required: false, imageField: "image" },
    ],
    [t]
  );

  const searchConfig = { field: "search", placeholder: "search_services" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      { header: t("status"), accessor: "status" },
      {
        header: t("image"),
        accessor: "image_url",
        render: (row) =>
          row.image_url ? (
            <img src={row.image_url} alt="image" className="w-12 h-12 object-cover" />
          ) : (
            t("no_image")
          ),
      },
      {
        header: t("date"),
        accessor: "created_at",
        render: (row) => new Date(row.created_at).toLocaleDateString() || t("not_specified"),
      },
      {
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={async () => {
              if (row) {
                try {
                  const response = await fetchServiceById(row.id, locale);
                  setSelectedService(response.data);
                  setIsEditModalOpen(true);
                } catch (err) {
                  const errorMessage = err.response?.data?.message || t("error");
                  toast.error(errorMessage, { autoClose: 3000 });
                }
              } else {
                toast.error(t("no_service_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedService(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_service_selected"), { autoClose: 3000 });
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
        pageTitle={t("services")}
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
      <center>
        <DashboardTable columns={columns} data={services} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addServiceMutation.mutate(data)}
        initialData={{}}
        fieldsConfig={fieldsConfig}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => updateServiceMutation.mutate({ id: selectedService.id, serviceData: data })}
        initialData={selectedService || {}}
        isEdit={true}
        fieldsConfig={fieldsConfig}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteServiceMutation.mutate(selectedService.id)}
        userName={selectedService?.name || ""}
      />
    </div>
  );
};

export default ServicePage;