"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardTable from "../../../../components/dashboard/DashboardTable";
import DetailsModal from "../../../../components/modals/DetailsModal";
import SaveCancelButtons from "../../../../components/SaveCancelButtons";
import { fetchMosques, fetchSessions, fetchTimeTables, addTimeTable, fetchSurah, fetchAyah,fetchChildren,fetchStudents,importTimeTables } from "../../../../lib/api";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import Select from "react-select";
import { useUser } from "../../../../context/userContext";
import { toast } from "react-toastify";
import { X, Upload, FileSpreadsheet, Users } from 'lucide-react';
 
const TimeTables = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [selectedMosque, setSelectedMosque] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [timeTables, setTimeTables] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const [formData, setFormData] = useState({
    user_id: "",
    date_from: "",
    date_to: "",
    type: "",
    pages: "",
    surah_from: "",
    surah_to: "",
    ayah_from: "",
    ayah_to: "",
  });

  useEffect(() => {
    setSelectedSession(null);
    setTimeTables([]);
  }, [selectedMosque]);

  // Fetch TimeTables
  const { data: timeTablesData = [], isLoading: timeTablesLoading } = useQuery({
    queryKey: ["timeTables", locale, user?.type],
    queryFn: () => fetchTimeTables({}, locale, user?.type),
    staleTime: 1 * 60 * 1000,
    enabled: user?.type !== "admin",
  });

  useEffect(() => {
    if (timeTablesData?.data?.data) {
      setTimeTables(timeTablesData?.data?.data);
    }
  }, [timeTablesData]);
  
  const { data: usersData = [], isLoading: usersLoading } = useQuery({
    queryKey: ["children", locale],
    queryFn: () => fetchChildren({}, locale, user?.type),
    staleTime: 1 * 60 * 1000,
    enabled: user?.type === "parent",
  });
  const { data: studentsData = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students", locale],
    queryFn: () => fetchStudents({}, locale, user?.type),
    staleTime: 1 * 60 * 1000,
    enabled: user?.type === "teacher",
  });
  const users = usersData?.data?.data || studentsData?.data?.data || [];

  // Fetch mosques
  const { data: mosquesData = [], isLoading: mosquesLoading } = useQuery({
    queryKey: ["mosques", locale],
    queryFn: () => fetchMosques({}, locale),
    enabled: user?.type === "admin",
  });
  const mosques = mosquesData?.data?.data || [];

  // Fetch sessions
  const { data: sessionsData = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions", selectedMosque?.value, locale],
    queryFn: () => fetchSessions({ mosque_id: selectedMosque.value }, locale),
    enabled: !!selectedMosque,
  });
  const sessions = sessionsData?.data?.data || [];

  // Fetch surahs
  const { data: surahsData = [], isLoading: surahsLoading } = useQuery({
    queryKey: ["surahs", locale],
    queryFn: () => fetchSurah({}, locale, user?.type),
    enabled: user?.type != "admin",
  });
  const surahs = surahsData?.data || [];

  // Fetch ayahs for surah_from
  const { data: ayahsFromData = [], isLoading: ayahsFromLoading } = useQuery({
    queryKey: ["ayahs_from", formData.surah_from, locale],
    queryFn: () => fetchAyah({ id: formData.surah_from }, locale, user?.type),
    enabled: !!formData.surah_from,
  });
  const ayahsFrom = ayahsFromData?.data || [];

  // Fetch ayahs for surah_to
  const { data: ayahsToData = [], isLoading: ayahsToLoading } = useQuery({
    queryKey: ["ayahs_to", formData.surah_to, locale],
    queryFn: () => fetchAyah({ id: formData.surah_to }, locale, user?.type),
    enabled: !!formData.surah_to,
  });
  const ayahsTo = ayahsToData?.data || [];

  // Fetch timetables
  useEffect(() => {
    if (selectedSession) {
      fetchTimeTables({ user_session_id: selectedSession.value }, locale).then((res) => {
        setTimeTables(res.data?.data || []);
      });
    } else {
      setTimeTables([]);
    }
  }, [selectedSession, locale, user?.type]);

  // Import timetables mutation
  const importTimeTablesMutation = useMutation({
    mutationFn: (formData) => importTimeTables(formData, locale, user?.type),
    onSuccess: (data) => {
      setIsImportModalOpen(false);
      queryClient.invalidateQueries(["students", filters, locale]);
      toast.success(data.message, { autoClose: 3000 });
    },
    onError: (err) => {
      const response = err.response?.data;
      let errorMessage = response?.message || t("error");
      if (response?.data && typeof response.data === "object") {
        const fieldErrors = Object.entries(response.data)
          .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
          .join(" | ");
        errorMessage += ` - ${fieldErrors}`;
      }
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    },
  });

  // Add timetable mutation
  const addTimeTableMutation = useMutation({
    mutationFn: (timeTableData) => addTimeTable(timeTableData, locale, user?.type),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(["timetables", selectedSession?.value, locale]);
        toast.success(data.message, { autoClose: 3000 });
        setIsAddModalOpen(false);
        setFormData({
          user_id: "",
          date_from: "",
          date_to: "",
          type: "",
          pages: "",
          surah_from: "",
          surah_to: "",
          ayah_from: "",
          ayah_to: "",
        });
      } else {
        throw new Error(data.message || t("error"));
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message || t("error");
      toast.error(errorMessage, { autoClose: 3000 });
    },
  });

  const handleShowDetails = (row) => {
    setSelectedTimetableId(row.id);
    setIsDetailsModalOpen(true);
  };

  const handleAddModalOpen = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleAddModalClose = useCallback(() => {
    setIsAddModalOpen(false);
    setFormData({
      user_id: "",
      date_from: "",
      date_to: "",
      type: "",
      pages: "",
      surah_from: "",
      surah_to: "",
      ayah_from: "",
      ayah_to: "",
    });
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
      ...(name === "surah_from" ? { ayah_from: "" } : {}), // Reset ayah_from if surah_from changes
      ...(name === "surah_to" ? { ayah_to: "" } : {}), // Reset ayah_to if surah_to changes
    }));
  }, []);

  const handleAddTimetable = useCallback(() => {
    if ((!formData.user_id && user?.type != "student") || !formData.date_from || !formData.date_to || !formData.type || !formData.pages) {
      toast.error(t("required_fields_missing"), { autoClose: 3000 });
      return;
    }
    const timeTableData = new FormData();
    if (user?.type != "student") {
      timeTableData.append("user_id", formData.user_id);
    }
    timeTableData.append("date_from", formatDate(formData.date_from));
    timeTableData.append("date_to", formatDate(formData.date_to));
    timeTableData.append("type", formData.type);
    timeTableData.append("pages", formData.pages);
    timeTableData.append("surah_from", formData.surah_from || "");
    timeTableData.append("surah_to", formData.surah_to || "");
    timeTableData.append("ayah_from", formData.ayah_from || "");
    timeTableData.append("ayah_to", formData.ayah_to || "");
    addTimeTableMutation.mutate(timeTableData);
  }, [formData, addTimeTableMutation, t]);

  // Convert YYYY-MM-DD to DD-MM-YYYY for API
  const formatDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  const columns = useMemo(
    () => [
      {
        header: t("student-name"),
        accessor: "user.name",
        render: (row) => row.user?.name || t("not_specified"),
      },
      {
        header: t("type"),
        accessor: "type",
        render: (row) => row.type || t("not_specified"),
      },
      {
        header: t("surah-from"),
        accessor: "surah_from",
        render: (row) => row.surah_from || t("not_specified"),
      },
      {
        header: t("surah-to"),
        accessor: "surah_to",
        render: (row) => row.surah_to || t("not_specified"),
      },
      {
        header: t("ayah-from"),
        accessor: "ayah_from",
        render: (row) => row.ayah_from || t("not_specified"),
      },
      {
        header: t("ayah-to"),
        accessor: "ayah_to",
        render: (row) => row.ayah_to || t("not_specified"),
      },
      {
        header: t("status"),
        accessor: "status",
        render: (row) => row.status || t("not_specified"),
      },
      {
        header: t("options"),
        accessor: "actions",
        render: (row) => (
          <button
            onClick={() => handleShowDetails(row)}
            className="text-primary-600 hover:text-primary-900"
          >
            {t("view-details")}
          </button>
        ),
      },
    ],
    [t]
  );

  const detailsFieldsConfig = useMemo(
    () => [
      { name: "user.name", label: t("student-name"), type: "text", readOnly: true, nested: true },
      { name: "dates", label: t("date"), type: "text", readOnly: true },
      { name: "type", label: t("type"), type: "text", readOnly: true },
      { name: "surah_from", label: t("surah-from"), type: "text", readOnly: true },
      { name: "surah_to", label: t("surah-to"), type: "text", readOnly: true },
      { name: "ayah_from", label: t("ayah-from"), type: "text", readOnly: true },
      { name: "ayah_to", label: t("ayah-to"), type: "text", readOnly: true },
      { name: "degree", label: t("degree"), type: "text", readOnly: true },
      { name: "status", label: t("status"), type: "text", readOnly: true },
      { name: "created_at", label: t("created_at"), type: "text", readOnly: true },
    ],
    [t]
  );

  const mosqueOptions = mosques?.map((mosque) => ({ value: mosque.id, label: mosque.name })) || [];
  const sessionOptions = sessions?.map((session) => ({ value: session.id, label: session.name })) || [];
  const userOptions = users?.map((user) => ({ value: user.id, label: user.name })) || [];
  const surahOptions = surahs?.map((surah) => ({ value: surah.number, label: surah.name })) || [];
  const ayahFromOptions = ayahsFrom?.map((ayah) => ({ value: ayah.numberInSurah, label: ayah.numberInSurah })) || [];
  const ayahToOptions = ayahsTo?.map((ayah) => ({ value: ayah.numberInSurah, label: ayah.numberInSurah })) || [];
  const typeOptions = [
    { value: "recite", label: t("recite") },
    { value: "main_review", label: t("main_review") },
    { value: "grand_review", label: t("grand_review") },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader pageTitle={t("timetables")} backUrl={`/${locale}/dashboard`} showAddButton={false}/>
      {user?.type === "admin" && (
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Select
              options={mosqueOptions}
              instanceId={"mosque"}
              onChange={setSelectedMosque}
              value={selectedMosque}
              placeholder={t("select-mosque")}
              isLoading={mosquesLoading}
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <Select
              options={sessionOptions}
              instanceId={"session"}
              onChange={setSelectedSession}
              value={selectedSession}
              placeholder={t("select-session")}
              isDisabled={!selectedMosque || sessionsLoading}
              isLoading={sessionsLoading}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">

      {(user?.type == "parent" || user?.type == "teacher" || user?.type == "student") && (
          <button
          onClick={handleAddModalOpen}
            className="bg-[#0B7459] hover:bg-[#095d47] mb-4 transition-colors duration-300 text-white py-2 px-6 rounded-xl font-medium"
            >
            {t("add-timetable")}
          </button>
      )}
      {user?.type == "teacher" && (
          <button
          onClick={() => setIsImportModalOpen(true)}
          className="bg-[#0B7459] hover:bg-[#095d47] mb-4 transition-colors duration-300 text-white py-2 px-6 rounded-xl font-medium"
            >
            {t("import_students")}
          </button>
      )}
      </div>
      <DashboardTable columns={columns} data={timeTables} />
      <ImportTimeTablesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={(data) => importTimeTablesMutation.mutate(data)}
        locale={locale}
      />

      {isDetailsModalOpen && (
        <DetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedTimetableId(null);
          }}
          timetableId={selectedTimetableId}
          locale={locale}
        />
      )}

      {isAddModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={handleAddModalClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[95%] overflow-y-auto">
              <h3 className="text-xl font-semibold text-[#0B7459] mb-4">{t("add-timetable")}</h3>
              <div className="space-y-4">
              {user?.type != "student" && (
              <Select
                  options={userOptions}
                  instanceId={"user_id"}
                  onChange={(option) => handleSelectChange("user_id", option)}
                  value={userOptions.find((option) => option.value === formData.user_id) || null}
                  placeholder={t("select-user")}
                  isLoading={usersLoading}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              )}
                <label className="block">
                  <span className="text-gray-700">{t("date-from")}</span>
                  <input
                    type="date"
                    name="date_from"
                    value={formData.date_from}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">{t("date-to")}</span>
                  <input
                    type="date"
                    name="date_to"
                    value={formData.date_to}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                </label>
                <Select
                  options={typeOptions}
                  instanceId={"type"}
                  onChange={(option) => handleSelectChange("type", option)}
                  value={typeOptions.find((option) => option.value === formData.type) || null}
                  placeholder={t("select-type")}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                <label className="block">
                  <span className="text-gray-700">{t("pages")}</span>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleFormChange}
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0B7459]"
                  />
                </label>
                <Select
                  options={surahOptions}
                  instanceId={"surah_from"}
                  onChange={(option) => handleSelectChange("surah_from", option)}
                  value={surahOptions.find((option) => option.value === formData.surah_from) || null}
                  placeholder={t("select-surah-from")}
                  isLoading={surahsLoading}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                <Select
                  options={ayahFromOptions}
                  instanceId={"ayah_from"}
                  onChange={(option) => handleSelectChange("ayah_from", option)}
                  value={ayahFromOptions.find((option) => option.value === formData.ayah_from) || null}
                  placeholder={t("select-ayah-from")}
                  isLoading={ayahsFromLoading}
                  isDisabled={!formData.surah_from}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                <Select
                  options={surahOptions}
                  instanceId={"surah_to"}
                  onChange={(option) => handleSelectChange("surah_to", option)}
                  value={surahOptions.find((option) => option.value === formData.surah_to) || null}
                  placeholder={t("select-surah-to")}
                  isLoading={surahsLoading}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                <Select
                  options={ayahToOptions}
                  instanceId={"ayah_to"}
                  onChange={(option) => handleSelectChange("ayah_to", option)}
                  value={ayahToOptions.find((option) => option.value === formData.ayah_to) || null}
                  placeholder={t("select-ayah-to")}
                  isLoading={ayahsToLoading}
                  isDisabled={!formData.surah_to}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <SaveCancelButtons onSave={handleAddTimetable} onCancel={handleAddModalClose} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimeTables;



const ImportTimeTablesModal = ({ isOpen, onClose, onSubmit, locale }) => {
  const t = useTranslations();
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState("student");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    console.log("Selected file:", selectedFile ? selectedFile.name : "No file selected");
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!file) {
      toast.error(t("no_file_selected"), { autoClose: 3000 });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    onSubmit(formData);
  }, [file, onSubmit, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{t("import_users")}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("upload_excel_file")}
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">{file.name}</p>
                      <p className="text-xs text-green-600">Ready to upload</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Drop your Excel file here or click to browse
                      </p>
                      <p className="text-xs text-gray-500">Supports .xlsx and .xls files</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!file}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {t("upload")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};