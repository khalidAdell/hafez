// src/app/[locale]/dashboard/mosques/page.jsx
"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import CustomActions from "../../../../components/modals/CustomActions";
import DeleteModal from "../../../../components/modals/DeleteModal";
import GlobalToast from "../../../../components/GlobalToast";
import MosqueModal from "./MosqueModal";
import {
  fetchMosques,
  addMosque,
  updateMosque,
  deleteMosque,
  fetchDistricts,
  fetchAssociations,
  fetchUsers,
} from "../../../../lib/api";
import { usePathname } from "next/navigation";

const MosquesPage = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort_by: "name",
    order: "asc",
    per_page: 15,
    district_id: "",
    association_id: "",
    user_id: "",
    pagination: 0,
  });
  const [error, setError] = useState(null);


  const { data: districts = [], error: districtsError } = useQuery({
    queryKey: ["districts", locale],
    queryFn: () => {
      return fetchDistricts({}, locale);
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: associations = [], error: associationsError } = useQuery({
    queryKey: ["associations", locale],
    queryFn: () => {
      return fetchAssociations({district_id: filters.district_id}, locale).then((res) => res.data.data);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!filters.district_id,
  });

  const { data: mosques = [], error: mosquesError } = useQuery({
    queryKey: ["mosques", filters, locale],
    queryFn: () => {
      return fetchMosques(filters, locale).then((res) => res.data.data);
    },
    staleTime: 1 * 60 * 1000,
  });

  const { data: teachers = [], error: teachersError } = useQuery({
    queryKey: ["users", locale],
    queryFn: () => {
      return fetchUsers({ ...filters, type: "teacher" }, locale).then((res) => res.data.data);
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (associationsError || districtsError || mosquesError || teachersError) {
      const errorMessage =
        associationsError?.message ||
        districtsError?.message ||
        mosquesError?.message ||
        teachersError?.message ||
        t("error_loading_data");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } else {
      setError(null);
    }
  }, [associationsError, districtsError, mosquesError, teachersError, t]);

  const addMosqueMutation = useMutation({
    mutationFn: (mosqueData) => addMosque(mosqueData, locale),
    onSuccess: () => {
      setIsAddModalOpen(false);
      queryClient.invalidateQueries(["mosques", filters, locale]);
      toast.success(t("mosque_added_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || t("error_adding_mosque");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const updateMosqueMutation = useMutation({
    mutationFn: ({ id, mosqueData }) => updateMosque(id, mosqueData, locale),
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["mosques", filters, locale]);
      toast.success(t("mosque_updated_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || t("error_updating_mosque");
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const deleteMosqueMutation = useMutation({
    mutationFn: (id) => deleteMosque(id, locale),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries(["mosques", filters, locale]);
      toast.success(t("mosque_deleted_successfully"), { autoClose: 3000 });
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || t("error_deleting_mosque");
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
      const updatedFilters = { ...newFilters };
      if (newFilters.district_name) {
        const selectedDistrict = districts.find(
          (district) => district.name === newFilters.district_name
        );
        updatedFilters.district_id = selectedDistrict
          ? selectedDistrict.id
          : "";
      } else {
        updatedFilters.district_id = "";
      }
      if (newFilters.association_name) {
        const selectedAssociation = associations.find(
          (assoc) => assoc.name === newFilters.association_name
        );
        updatedFilters.association_id = selectedAssociation
          ? selectedAssociation.id
          : "";
      } else {
        updatedFilters.association_id = "";
      }
      delete updatedFilters.district_name;
      delete updatedFilters.association_name;
      setFilters((prev) => ({ ...prev, ...updatedFilters }));
    }, 500),
    [districts, associations]
  );

  const handleResetFilters = useCallback(() => {
    console.log("Resetting filters");
    setFilters({
      status: "",
      search: "",
      sort_by: "name",
      order: "asc",
      per_page: 15,
      district_id: "",
      association_id: "",
      user_id: "",
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
        name: "district_name",
        label: "district",
        type: "select",
        options: districts.map((district) => ({
          value: district.name,
          label: district.name,
        })),
      },
      {
        name: "association_name",
        label: "association",
        type: "select",
        options: associations.map((assoc) => ({
          value: assoc.name,
          label: assoc.name,
        })),
      },
      {
        name: "pagination",
        label: "pagination",
        type: "number",
        min: 0,
      },
    ],
    [districts, associations]
  );

  const fieldsConfig = useMemo(
    () => [
      { name: "name_ar", label: "mosque_name", type: "text", required: true },
      { name: "name_en", label: "mosque_name_en", type: "text", required: true },
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
        name: "district_id",
        label: "district",
        type: "select",
        options: districts.map((district) => ({
          value: district.id,
          label: district.name,
        })),
      },
      {
        name: "association_id",
        label: "association",
        type: "select",
        options: associations.map((assoc) => ({
          value: assoc.id,
          label: assoc.name,
        })),
      },
      {
        name: "user_id",
        label: "responsiblemosque",
        type: "select",
        options: teachers.map((teacher)=>({
          value: teacher.id,
          label: teacher.name,
        })),
      },

    ],
    [districts, associations]
  );

  const searchConfig = { field: "search", placeholder: "search_mosques" };

  const columns = useMemo(
    () => [
      { header: t("id"), accessor: "id" },
      { header: t("mosque_name"), accessor: "name" },
      {
        header: t("responsiblemosque"),
        accessor: "user",
        render: (row) => row.user?.name || "غير محدد",
      },

      {
        header: t("district"),
        accessor: "district",
        render: (row) => row.district?.name || "غير محدد",
      },
      {
        header: t("association"),
        accessor: "association",
        render: (row) => row.association?.name || "غير محدد",
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
        header: t("options"),
        accessor: "options",
        render: (row) => (
          <CustomActions
            userId={row.id}
            onEdit={() => {
              if (row) {
                setSelectedMosque(row);
                setIsEditModalOpen(true);
              } else {
                toast.error(t("no_mosque_selected"), { autoClose: 3000 });
              }
            }}
            onDelete={() => {
              if (row) {
                setSelectedMosque(row);
                setIsDeleteModalOpen(true);
              } else {
                toast.error(t("no_mosque_selected"), { autoClose: 3000 });
              }
            }}
          />
        ),
      },
    ],
    [t]
  );

  const optimizedFetchDependencies = useMemo(
    () => ({
      district_id: async () => {
        const cachedData = queryClient.getQueryData([
          "districts",
          locale,
        ]);
        if (cachedData) {
          return cachedData;
        }
        return await fetchDistricts({}, locale);
      },
      association_id: async (districtId) => {
        const cachedData = queryClient.getQueryData(["associations",districtId, locale]);
        if (cachedData) {
          return cachedData;
        }
        return await fetchAssociations({district_id: districtId}, locale).then((res) => res.data.data);
      },
    }),
    [locale, queryClient]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GlobalToast />
      <DashboardHeader
        pageTitle={t("mosques")}
        backUrl={`/${locale}/dashboard`}
        onAdd={() => setIsAddModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={{
          ...filters,
          district_name:
            districts.find((district) => district.id === filters.district_id)
              ?.name || "",
          association_name:
            associations.find((assoc) => assoc.id === filters.association_id)
              ?.name || "",
        }}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <center>
        <DashboardTable columns={columns} data={mosques} />
      </center>
      <MosqueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addMosqueMutation.mutate(data)}
        initialData={{ status: "active" }}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
      />
      <MosqueModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) =>
          updateMosqueMutation.mutate({
            id: selectedMosque.id,
            mosqueData: data,
          })
        }
        initialData={selectedMosque || {}}
        isEdit={true}
        fieldsConfig={fieldsConfig}
        fetchDependencies={optimizedFetchDependencies}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMosqueMutation.mutate(selectedMosque.id)}
        userName={selectedMosque?.name || ""}
      />
    </div>
  );
};

export default MosquesPage;
