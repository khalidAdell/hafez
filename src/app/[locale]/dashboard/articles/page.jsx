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
import { usePathname } from "next/navigation";
import {
  fetchBlogSections,
  addBlogSection,
  updateBlogSection,
  deleteBlogSection,
  fetchBlogSectionById,
} from "../../../../lib/api";

const BlogSectionsPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlogSection, setSelectedBlogSection] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: blogSectionsResponse, error: blogSectionsError } = useQuery({
    queryKey: ["blogSections", filters, locale],
    queryFn: () => {
      console.log(`Fetching blog sections with filters:`, filters);
      return fetchBlogSections(filters, locale);
    },
    staleTime: 1 * 60 * 1000,
  });

  const blogSections = blogSectionsResponse?.data?.data || [];

  const { data: blogSectionData, error: blogSectionError } = useQuery({
    queryKey: ["blogSection", selectedBlogSection?.id, locale],
    queryFn: () => fetchBlogSectionById(selectedBlogSection?.id, locale),
    enabled: !!selectedBlogSection?.id && isEditModalOpen,
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (blogSectionsError) {
      const errorMessage = blogSectionsError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else if (blogSectionError) {
      const errorMessage = blogSectionError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [blogSectionsError, blogSectionError, t]);

  const addBlogSectionMutation = useMutation({
    mutationFn: (blogSectionData) => addBlogSection(blogSectionData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["blogSections", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      console.error("Add blog section error:", err.response?.data || err);
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateBlogSectionMutation = useMutation({
    mutationFn: ({ id, blogSectionData }) =>
      updateBlogSection({ id, blogSectionData }, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["blogSections", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      console.error("Update blog section error:", err.response?.data || err);
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteBlogSectionMutation = useMutation({
    mutationFn: (id) => deleteBlogSection(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["blogSections", filters, locale]);
      toast.success(t("deleted_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      console.error("Delete blog section error:", err.response?.data || err);
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
      status: "",
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
        name: "status",
        label: "status",
        type: "select",
        options: [
          { value: "active", label: "active" },
          { value: "inactive", label: "inactive" },
        ],
      },
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
      {
        name: "status",
        label: "status",
        type: "select",
        required: true,
        options: [
          { value: "active", label: "active" },
          { value: "inactive", label: "inactive" },
        ],
      },
    ],
    []
  );

  const searchConfig = { field: "search", placeholder: "search_blog_sections" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      {
        header: t("name"),
        accessor: "name",
        render: (row) => row.name || "N/A",
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
            {row.status || "N/A"}
          </span>
        ),
      },
      {
        header: t("date"),
        accessor: "created_at_humanly",
        render: (row) => row.created_at_humanly || "N/A",
      },
      {
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={() => {
              if (row) {
                setSelectedBlogSection(row);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_item_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedBlogSection(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_item_selected"), { autoClose: 3000 });
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
        <DashboardTable columns={columns} data={blogSections} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addBlogSectionMutation.mutate(data)}
        initialData={{}}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) =>
          updateBlogSectionMutation.mutate({
            id: selectedBlogSection.id,
            blogSectionData: data,
          })
        }
        initialData={
          blogSectionData?.data || {
            name_ar: selectedBlogSection?.name || "",
            name_en: selectedBlogSection?.name || "",
            status: selectedBlogSection?.status || "active",
          }
        }
        isEdit={true}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() =>
          deleteBlogSectionMutation.mutate(selectedBlogSection.id)
        }
        userName={selectedBlogSection?.name || ""}
      />
    </div>
  );
};

export default BlogSectionsPage;
