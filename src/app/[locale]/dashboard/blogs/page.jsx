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
  fetchBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
  fetchBlogById,
  fetchBlogSections,
} from "../../../../lib/api";

const BlogPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [filters, setFilters] = useState({
    category_id: "",
    search: "",
    sort_by: "title",
    order: "asc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: blogSections = [], error: blogSectionsError } = useQuery({
    queryKey: ["blogSections", locale],
    queryFn: () => {
      return fetchBlogSections({}, locale).then((res) => {
        if (!res.data?.data) {
          throw new Error("البيانات المرجعة من fetchBlogSections ليست مصفوفة");
        }
        return res.data.data;
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: blogsResponse, error: blogsError } = useQuery({
    queryKey: ["blogs", filters, locale],
    queryFn: () => {
      return fetchBlogs(filters, locale);
    },
    staleTime: 1 * 60 * 1000,
  });

  const blogs = blogsResponse?.data?.data || [];

  const { data: blogData, error: blogError } = useQuery({
    queryKey: ["blog", selectedBlog?.id, locale],
    queryFn: () => fetchBlogById(selectedBlog?.id, locale),
    enabled: !!selectedBlog?.id && isEditModalOpen,
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (blogsError || blogSectionsError || blogError) {
      const errorMessage =
        blogsError?.message ||
        blogSectionsError?.message ||
        blogError?.message ||
        t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [blogsError, blogSectionsError, blogError, t]);

  const addBlogMutation = useMutation({
    mutationFn: (blogData) => {
      return addBlog(blogData, locale);
    },
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["blogs", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      console.error("Add blog error:", err.response?.data || err);
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, blogData }) => {
      return updateBlog({ id, blogData }, locale);
    },
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["blogs", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      console.error("Update blog error:", err.response?.data || err);
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id) => deleteBlog(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["blogs", filters, locale]);
      toast.success(t("deleted_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message ===
        "حدث خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى لاحقًا."
          ? t("delete_failed_related_data")
          : err.response?.data?.message || t("error");
      console.error("Delete blog error:", err.response?.data || err);
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
      const updatedFilters = { ...newFilters };
      if (newFilters.category_name) {
        const selectedCategory = blogSections.find(
          (category) => category.name === newFilters.category_name
        );
        updatedFilters.category_id = selectedCategory
          ? selectedCategory.id
          : "";
        delete updatedFilters.category_name;
      } else {
        updatedFilters.category_id = "";
      }
      setFilters((prev) => ({ ...prev, ...updatedFilters }));
    }, 500),
    [blogSections]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      category_id: "",
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
        name: "category_name",
        label: "category",
        type: "select",
        options: Array.isArray(blogSections)
          ? blogSections.map((category) => ({
              value: category.name,
              label: category.name,
            }))
          : [],
      },
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
      },
    ],
    [blogSections]
  );

  const fieldsConfig = useMemo(
    () => [
      { name: "title_ar", label: "title_ar", type: "text", required: true },
      { name: "title_en", label: "title_en", type: "text", required: true },
      {
        name: "short_description_ar",
        label: "short_description_ar",
        type: "text",
        required: true,
      },
      {
        name: "short_description_en",
        label: "short_description_en",
        type: "text",
        required: true,
      },
      {
        name: "description_ar",
        label: "description_ar",
        type: "textarea",
        required: true,
      },
      {
        name: "description_en",
        label: "description_en",
        type: "textarea",
        required: true,
      },
      {
        name: "category_id",
        label: "category",
        type: "select",
        required: true,
        options: Array.isArray(blogSections)
          ? blogSections.map((category) => ({
              value: category.id,
              label: category.name,
            }))
          : [],
      },
      {
        name: "img",
        label: "image",
        type: "image-picker",
        required: true,
        imageField: "img",
      },
    ],
    [blogSections]
  );

  const searchConfig = { field: "search", placeholder: "search_blogs" };

  const optimizedFetchDependencies = useMemo(
    () => ({
      category_id: async () => {
        const cachedData = queryClient.getQueryData(["blogSections", locale]);
        if (cachedData) {
          return Array.isArray(cachedData) ? cachedData : cachedData.data || [];
        }
        return await fetchBlogSections({}, locale).then(
          (res) => res.data.data || []
        );
      },
    }),
    [locale, queryClient]
  );

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      {
        header: t("title"),
        accessor: "title",
        render: (row) => row.title || "N/A",
      },
      {
        header: t("category"),
        accessor: "category",
        render: (row) => row.category?.name || "N/A",
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
                setSelectedBlog({
                  ...row,
                  img: row.img || "",
                  img_url: row.image_url || "",
                });
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_item_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedBlog(row);
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
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("Blog")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => setIsAddModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={{
          ...filters,
          category_name: Array.isArray(blogSections)
            ? blogSections.find(
                (category) => category.id === filters.category_id
              )?.name || ""
            : "",
        }}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={blogs} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => {
          addBlogMutation.mutate(data);
        }}
        initialData={{ img: "", img_url: "" }}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
        locale={locale}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => {
          updateBlogMutation.mutate({
            id: selectedBlog.id,
            blogData: data,
          });
        }}
        initialData={
          blogData?.data || {
            title_ar: selectedBlog?.title || "",
            title_en: selectedBlog?.title || "",
            short_description_ar: selectedBlog?.short_description || "",
            short_description_en: selectedBlog?.short_description || "",
            description_ar: blogData?.data?.description_ar || "",
            description_en: blogData?.data?.description_en || "",
            category_id: selectedBlog?.category_id || "",
            img: selectedBlog?.img || "",
            img_url: selectedBlog?.image_url || "",
          }
        }
        isEdit={true}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
        locale={locale}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteBlogMutation.mutate(selectedBlog.id)}
        userName={selectedBlog?.title || ""}
      />
    </div>
  );
};

export default BlogPage;
