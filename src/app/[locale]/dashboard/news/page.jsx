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
import { fetchGallery, addGallery, updateGallery, deleteGallery, fetchGallerySections, fetchGalleryById } from "../../../../lib/api";
import { usePathname } from "next/navigation";

const NewsPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNew, setSelectedNew] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    sort_by: "title",
    type: "news",
    order: "asc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: news = [], error: newsError } = useQuery({
    queryKey: ["news", filters, locale],
    queryFn: () => fetchGallery(filters, locale).then((res) => res.data.data),
    staleTime: 1 * 60 * 1000,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["gallerySections", locale],
    queryFn: () => fetchGallerySections({}, locale).then((res) => res.data.data),
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (newsError) {
      const errorMessage = newsError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [newsError, t]);

  const addNewMutation = useMutation({
    mutationFn: (newData) => addGallery(newData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["news", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateNewMutation = useMutation({
    mutationFn: ({ id, newData }) => updateGallery(id, newData, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["news", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteNewMutation = useMutation({
    mutationFn: (id) => deleteGallery(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["news", filters, locale]);
      toast.success(t("new_deleted_successfully"), { autoClose: 3000 });
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
      sort_by: "title",
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
        name: "type",
        label: "type",
        type: "select",
        options: [
          { value: "news", label: t("news") },
        ],
      },
    ],
    [t]
  );

  const fieldsConfig = useMemo(
    () => [
      { name: "title_ar", label: "title_ar", type: "text", required: true },
      { name: "title_en", label: "title_en", type: "text", required: true },
      {
        name: "type",
        label: "type",
        type: "select",
        options: [
          { value: "news", label: t("news") },
        ],
        required: true,
      },
      {
        name: "section_id",
        label: "section",
        type: "select",
        options: sections.map((section) => ({
          value: section.id,
          label: section.name || section.name_ar || section.name_en,
        })),
        required: true,
      },
      { name: "icon", label: "icon", type: "image-picker", required: false, imageField: "icon" },
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
    ],
    [sections, t]
  );

  const searchConfig = { field: "search", placeholder: "search_news" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("title"), accessor: "title" },
      { header: t("type"), accessor: "type" },
      {
        header: t("icon"),
        accessor: "icon_url",
        render: (row) =>
          row.icon_url ? (
            <img src={row.icon_url} alt="icon" className="w-12 h-12 object-cover" />
          ) : (
            t("no_icon")
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
                  const response = await fetchGalleryById(row.id, locale);
                  setSelectedNew(response.data);
                  setIsEditModalOpen(true);
                } catch (err) {
                  const errorMessage = err.response?.data?.message || t("error");
                  toast.error(errorMessage, { autoClose: 3000 });
                }
              } else {
                toast.error(t("no_new_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedNew(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_new_selected"), { autoClose: 3000 });
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
        pageTitle={t("news")}
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
        <DashboardTable columns={columns} data={news} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addNewMutation.mutate(data)}
        initialData={{}}
        fieldsConfig={fieldsConfig}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => updateNewMutation.mutate({ id: selectedNew.id, newData: data })}
        initialData={selectedNew || {}}
        isEdit={true}
        fieldsConfig={fieldsConfig}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteNewMutation.mutate(selectedNew.id)}
        userName={selectedNew?.title || ""}
      />
    </div>
  );
};

export default NewsPage;