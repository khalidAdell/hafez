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
import { fetchCertificateTemplates, addCertificateTemplate, updateCertificateTemplate, deleteCertificateTemplate, fetchCertificateTemplateById } from "../../../../lib/api";
import { usePathname } from "next/navigation";

const CertificateTemplatesPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    sort_by: "title",
    order: "asc",
    per_page: 15,
    pagination: 0,
  });
  const [error, setError] = useState(null);

  const { data: templates = [], error: templatesError } = useQuery({
    queryKey: ["certificateTemplates", filters, locale],
    queryFn: () => fetchCertificateTemplates(filters, locale).then((res) => res.data.data),
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (templatesError) {
      const errorMessage = templatesError?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [templatesError, t]);

  const addTemplateMutation = useMutation({
    mutationFn: (templateData) => addCertificateTemplate(templateData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["certificateTemplates", filters, locale]);
      toast.success(t("added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, templateData }) => updateCertificateTemplate(id, templateData, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["certificateTemplates", filters, locale]);
      toast.success(t("updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t("error");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => deleteCertificateTemplate(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["certificateTemplates", filters, locale]);
      toast.success(t("template_deleted_successfully"), { autoClose: 3000 });
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
    ],
    [t]
  );

  const fieldsConfig = useMemo(
    () => [
      { name: "title", label: "title", type: "text", required: true },
      { name: "template", label: "template", type: "image-picker", required: false, imageField: "template" },
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
      {
        name: "is_default",
        label: "is_default",
        type: "select",
        options: [
          { value: "1", label: t("yes") },
          { value: "0", label: t("no") },
        ],
        required: true,
      },
    ],
    [t]
  );

  const searchConfig = { field: "search", placeholder: "search_templates" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("title"), accessor: "title" },
      {
        header: t("template"),
        accessor: "template",
        render: (row) =>
          row.template ? (
            <img src={row.template} alt="template" className="w-12 h-12 object-cover" />
          ) : (
            t("no_image")
          ),
      },
      {
        header: t("status"),
        accessor: "status",
        render: (row) => t(row.status),
      },
      {
        header: t("is_default"),
        accessor: "is_default",
        render: (row) => (row.is_default ? t("yes") : t("no")),
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
                  const response = await fetchCertificateTemplateById(row.id, locale);
                  setSelectedTemplate(response.data);
                  setIsEditModalOpen(true);
                } catch (err) {
                  const errorMessage = err.response?.data?.message || t("error");
                  toast.error(errorMessage, { autoClose: 3000 });
                }
              } else {
                toast.error(t("no_template_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedTemplate(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_template_selected"), { autoClose: 3000 });
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
        pageTitle={t("certificate_templates")}
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
        <DashboardTable columns={columns} data={templates} />
      </center>
      <GenericModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addTemplateMutation.mutate(data)}
        initialData={{}}
        fieldsConfig={fieldsConfig}
      />
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => updateTemplateMutation.mutate({ id: selectedTemplate.id, templateData: data })}
        initialData={selectedTemplate || {}}
        isEdit={true}
        fieldsConfig={fieldsConfig}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteTemplateMutation.mutate(selectedTemplate.id)}
        userName={selectedTemplate?.title || ""}
      />
    </div>
  );
};

export default CertificateTemplatesPage;