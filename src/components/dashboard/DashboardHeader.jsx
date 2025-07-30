"use client";

import { IoAdd, IoSearch, IoFilter, IoDownloadOutline } from "react-icons/io5";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";

const FilterDropdown = ({ isOpen, onClose, onApply, onReset, currentFilters = {}, filterConfig }) => {
  const t = useTranslations();
  const [filters, setFilters] = useState(currentFilters);
  const dropdownRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full mt-2 left-0 w-full md:w-80 bg-white rounded-lg shadow-lg p-4 z-50 max-h-[300px] overflow-y-auto border border-gray-200"
     
    >
      <h2 className="text-lg font-bold text-[#0B7459] mb-3">{t("filter")}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {filterConfig.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700">{t(field.label)}</label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={filters[field.name] || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
              >
                <option value="">{t("all")}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            ) : field.type === "number" ? (
              <input
                type="number"
                name={field.name}
                value={filters[field.name] || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                min={field.min || 0}
                placeholder={t(field.label)}
              />
            ) : (
              <input
                type="text"
                name={field.name}
                value={filters[field.name] || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                placeholder={t(field.label)}
              />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm"
          >
            {t("reset_filters")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-[#0B7459] text-white rounded-lg hover:bg-[#096a4d] text-sm"
          >
            {t("apply_filters")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function DashboardHeader({
  pageTitle,
  backUrl,
  addUrl,
  onAdd,
  onSearch,
  onFilter,
  onResetFilters,
  filterConfig = [],
  searchConfig = { field: "search", placeholder: "search" },
  currentFilters = {},
}) {
  const t = useTranslations();
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(currentFilters[searchConfig.field] || "");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="bg-white shadow-sm p-4 mb-6 rounded-lg relative" >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Page Path */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-gray-600 text-base sm:text-lg font-medium">
            <Link href={backUrl } className="hover:underline text-gray-600">
              {t("dashboardHome")}
            </Link>
            <span>›</span>
            <span className="text-gray-600">{pageTitle}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-col md:flex-row sm:items-stretch md:items-center w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-64  ">
            <input
              type="text"
              placeholder={t("search") || "Search..."}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full rtl:pr-10 ltr:pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
            />
            <IoSearch className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex relative">
            {/* Filter */}
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="w-full md:w-auto p-2 hover:bg-gray-100 rounded-lg flex justify-center items-center"
              title={t("filter")}
            >
              <IoFilter className="h-5 w-5 text-gray-600" />
            </button>
            <FilterDropdown
              isOpen={isFilterDropdownOpen}
              onClose={() => setIsFilterDropdownOpen(false)}
              onApply={onFilter}
              onReset={onResetFilters}
              currentFilters={currentFilters}
              filterConfig={filterConfig}
            />

            {/* Export */}
            <button
              className="w-full md:w-auto p-2 hover:bg-gray-100 rounded-lg flex justify-center items-center"
              title={t("export")}
            >
              <IoDownloadOutline className="h-5 w-5 text-gray-600" />
            </button>

            {/* Add Button */}
            {addUrl ? (
              <Link
                href={addUrl}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0B7459] text-white px-4 py-2 rounded-lg hover:bg-[#096a4d] transition-colors text-sm sm:text-base"
              >
                <IoAdd className="h-5 w-5" />
                <span>{t("add")}</span>
              </Link>
            ) : (
              <button
                onClick={onAdd}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0B7459] text-white px-4 py-2 rounded-lg hover:bg-[#096a4d] transition-colors text-sm sm:text-base"
              >
                <IoAdd className="h-5 w-5" />
                <span>{t("add")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}