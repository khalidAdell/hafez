"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import DashboardHeader from '../../../../components/dashboard/DashboardHeader';
import DashboardTable from '../../../../components/dashboard/DashboardTable';
import DetailsModal from '../../../../components/modals/DetailsModal';
import { fetchChildren, fetchChildrenById } from '../../../../lib/api';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Select from 'react-select';
import { useUser } from '../../../../context/userContext';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';

const Children = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const { user } = useUser();

  const [selectedMosque, setSelectedMosque] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [children, setChildren] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    mosque: "",
    session: "",
    sort_by: "name",
    order: "asc",
    per_page: 10,
    pagination: 1,
  });
  const [error, setError] = useState(null);

  // Fetch children data based on filters
  useEffect(() => {
    if (user?.type !== "admin") {
      fetchChildren(filters, locale, user?.type)
        .then((res) => {
          setChildren(res.data?.data || []);
          setError(null);
        })
        .catch((err) => {
          const errorMessage = err.response?.data?.message || t("error_loading_data");
          setError(errorMessage);
          toast.error(errorMessage, { autoClose: 3000 });
        });
    } else {
      setChildren([]);
      setError(t("no_data_available"));
    }
  }, [user?.type, filters, locale, t]);

  const handleShowDetails = (row) => {
    setSelectedChildId(row.id);
    setIsDetailsModalOpen(true);
  };

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((searchTerm) => {
      setFilters((prev) => ({ ...prev, search: searchTerm, pagination: 1 }));
    }, 500),
    []
  );

  // Debounced filter handler
  const handleFilter = useCallback(
    debounce((newFilters) => {
      setFilters((prev) => ({ ...prev, ...newFilters, pagination: 1 }));
    }, 500),
    []
  );

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({
      search: "",
      mosque: "",
      session: "",
      sort_by: "name",
      order: "asc",
      per_page: 10,
      pagination: 1,
    });
    setSelectedMosque(null);
    setSelectedSession(null);
  }, []);

  // Filter configuration
  const filterConfig = useMemo(
    () => [
      {
        name: "mosque",
        label: t("mosque"),
        type: "select",
        options: [
          // Populate with mosque options, e.g., from an API
          { value: "mosque1", label: "Mosque 1" },
          { value: "mosque2", label: "Mosque 2" },
        ],
        onChange: (option) => {
          setSelectedMosque(option);
          handleFilter({ mosque: option?.value || "" });
        },
        value: selectedMosque,
      },
      {
        name: "session",
        label: t("session"),
        type: "select",
        options: [
          // Populate with session options, e.g., from an API
          { value: "session1", label: "Session 1" },
          { value: "session2", label: "Session 2" },
        ],
        onChange: (option) => {
          setSelectedSession(option);
          handleFilter({ session: option?.value || "" });
        },
        value: selectedSession,
      },
      {
        name: "sort_by",
        label: t("sort_by"),
        type: "select",
        options: [
          { value: "name", label: t("name") },
          { value: "created_at", label: t("created_at") },
        ],
      },
      {
        name: "order",
        label: t("order"),
        type: "select",
        options: [
          { value: "asc", label: t("ascending") },
          { value: "desc", label: t("descending") },
        ],
      },
      {
        name: "per_page",
        label: t("per_page"),
        type: "number",
        min: 1,
      },
      {
        name: "pagination",
        label: t("pagination"),
        type: "number",
        min: 1,
      },
    ],
    [t]
  );

  // Search configuration
  const searchConfig = useMemo(
    () => ({
      field: "search",
      placeholder: t("search_children"),
    }),
    [t]
  );

  const columns = useMemo(
    () => [
      {
        header: t("name"),
        accessor: "name",
        render: (row) => row.name || t("not_specified"),
      },
      {
        header: t("email"),
        accessor: "email",
        render: (row) => row.email || t("not_specified"),
      },
      {
        header: t("phone"),
        accessor: "phone",
        render: (row) => row.phone || t("not_specified"),
      },
      {
        header: t("image"),
        accessor: "image",
        render: (row) =>
          row.profile_picture ? (
            <img
              src={row.profile_picture}
              alt=""
              className="w-10 h-10 rounded-full"
            />
          ) : (
            t("not_specified")
          ),
      },
      {
        header: t("national_id"),
        accessor: "national_id",
        render: (row) => row.national_id || t("not_specified"),
      },
      {
        header: t("city"),
        accessor: "city",
        render: (row) => row.city || t("not_specified"),
      },
      {
        header: t("district"),
        accessor: "district",
        render: (row) => row.district || t("not_specified"),
      },
    ],
    [t]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        pageTitle={t("children")}
        backUrl={`/${locale}/dashboard`}
        showAddButton={false}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onResetFilters={handleResetFilters}
        filterConfig={filterConfig}
        searchConfig={searchConfig}
        currentFilters={filters}
      />
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <DashboardTable columns={columns} data={children} onRowClick={handleShowDetails} />

      {isDetailsModalOpen && (
        <DetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedChildId(null);
          }}
          childId={selectedChildId}
          locale={locale}
        />
      )}
    </div>
  );
};

export default Children;