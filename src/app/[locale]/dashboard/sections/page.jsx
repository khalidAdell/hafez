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
import { fetchGallerySections, addGallerySection, updateGallerySection, deleteGallerySection,fetchGalleryById } from "../../../../lib/api";
import { usePathname } from "next/navigation";

const SectionsPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: sections = [], error: sectionsError } = useQuery({
    queryKey: ["sections", filters, locale],
    queryFn: () => {
      return fetchGallerySections(filters, locale).then((res) => res.data.data);
    },
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (sectionsError) {
      const errorMessage = sectionsError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [sectionsError, t]);

  const addSectionMutation = useMutation({
    mutationFn: (sectionData) => addGallerySection(sectionData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["sections", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, sectionData }) => updateGallerySection(id, sectionData, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["sections", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id) => deleteGallerySection(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["sections", filters, locale]);
      toast.success(t("section_deleted_successfully"), { autoClose: 3000 });
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
      console.log("Applying filters:", newFilters);
      setFilters((prev) => ({ ...prev, ...newFilters }));
    }, 500),
    []
  );

  const handleResetFilters = useCallback(() => {
    console.log("Resetting filters");
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
    ],
    []
  );

  const fieldsConfig = useMemo(
    () => [
      { name: "name_ar", label: "name_ar", type: "text", required: true },
      { name: "name_en", label: "name_en", type: "text", required: true },
      { name: "image_id", label: "image", type: "image-picker", required: true, imageField: "upload_id" },
    ],
    []
  );

  const searchConfig = { field: "search", placeholder: "search_sections" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      {
        header: t("date"),
        accessor: "created_at",
        render: (row) => new Date(row.created_at).toLocaleDateString() || "غير محدد",
      },
      {
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={() => {
              if (row) {
                setSelectedSection(row);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_section_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedSection(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_section_selected"), { autoClose: 3000 });
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
      {/* <GlobalToast /> */}
      <DashboardHeader
        pageTitle={t("sections")}
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
        <DashboardTable columns={columns} data={sections} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addSectionMutation.mutate(data)}
        initialData={{}}
        fieldsConfig={fieldsConfig}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => updateSectionMutation.mutate({ id: selectedSection.id, sectionData: data })}
        initialData={selectedSection || {}}
        isEdit={true}
        fieldsConfig={fieldsConfig}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteSectionMutation.mutate(selectedSection.id)}
        userName={selectedSection?.name || ""}
      />
    </div>
  );
};

export default SectionsPage;