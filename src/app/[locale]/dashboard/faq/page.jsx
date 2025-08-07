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
  fetchFaqs,
  addFaq,
  updateFaq,
  deleteFaq,
  fetchFaqById,
} from "../../../../lib/api";

const FaqPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: faqsResponse, error: faqsError } = useQuery({
    queryKey: ["faqs", filters, locale],
    queryFn: () => {
      console.log(`Fetching FAQs with filters:`, filters);
      return fetchFaqs(filters, locale);
    },
    staleTime: 1 * 60 * 1000,
  });

  const faqs = faqsResponse?.data?.data || [];

  const { data: faqData, error: faqError } = useQuery({
    queryKey: ["faq", selectedFaq?.id, locale],
    queryFn: () => fetchFaqById(selectedFaq?.id, locale),
    enabled: !!selectedFaq?.id && isEditModalOpen,
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (faqsError) {
      const errorMessage = faqsError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else if (faqError) {
      const errorMessage = faqError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [faqsError, faqError, t]);

  const addFaqMutation = useMutation({
    mutationFn: (faqData) => addFaq(faqData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["faqs", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: ({ id, faqData }) => updateFaq({ id, faqData }, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["faqs", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id) => deleteFaq(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["faqs", filters, locale]);
      toast.success(t("deleted_successfully"), { autoClose: 3000 });
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
      { name: "name_ar", label: "faq_name_ar", type: "text", required: true },
      { name: "name_en", label: "faq_name_en", type: "text", required: true },
      {
        name: "content_ar",
        label: "faq_content_ar",
        type: "text",
        required: true,
      },
      {
        name: "content_en",
        label: "faq_content_en",
        type: "text",
        required: true,
      },
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

  const searchConfig = { field: "search", placeholder: "search_faqs" };

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
        header: t("created_at"),
        accessor: "created_at_humanly",
      },
      {
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={() => {
              if (row) {
                setSelectedFaq(row);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_faq_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedFaq(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_faq_selected"), { autoClose: 3000 });
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
        pageTitle={t("faq")}
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
        <DashboardTable columns={columns} data={faqs} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addFaqMutation.mutate(data)}
        initialData={{}}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) =>
          updateFaqMutation.mutate({ id: selectedFaq.id, faqData: data })
        }
        initialData={
          faqData?.data || {
            name_ar: selectedFaq?.name_ar || "",
            name_en: selectedFaq?.name_en || "",
            content_ar: selectedFaq?.content_ar || "",
            content_en: selectedFaq?.content_en || "",
            status: selectedFaq?.status || "active",
          }
        }
        isEdit={true}
        fieldsConfig={fieldsConfig}
        locale={locale}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteFaqMutation.mutate(selectedFaq.id)}
        userName={selectedFaq?.name || ""}
      />
    </div>
  );
};

export default FaqPage;
