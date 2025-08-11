"use client";

import React, { useState, useCallback } from "react";
import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  isSaturday,
  parseISO,
  subYears,
  addYears,
} from "date-fns";
import { ar as arLocale } from "date-fns/locale"; // Import Arabic locale
import { ChevronLeft, ChevronRight, FileSpreadsheet, Upload, Users, X,CheckCircle, AlertCircle, ChevronDown, Hash, BookOpen, MessageSquare, List, Calendar} from "lucide-react";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import { useLocale, useTranslations } from "next-intl";
import { fetchAttendance, createAttendance, fetchStudents, fetchUsers, fetchChildren, importAttendance } from "../../../../lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../../../../context/userContext";
import { toast } from "react-toastify";
 

const options = ["present", "late", "absent", "absent_excused"];

const statusColors = {
  present: "bg-emerald-100 text-emerald-800 border-emerald-200",
  late: "bg-amber-100 text-amber-800 border-amber-200",
  absent: "bg-red-100 text-red-800 border-red-200",
  absent_excused: "bg-blue-100 text-blue-800 border-blue-200",
};

const getWeekStart = (today) => {
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  if (isSaturday(today)) {
    return addWeeks(startOfCurrentWeek, 1); // next Sunday
  }
  return startOfCurrentWeek; // current Sunday
};

export default function AttendanceCalendar() {
  const locale = useLocale();
  const t = useTranslations(); // Initialize translations
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const { user } = useUser();
  const [resData, setResData] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false); // State for result modal
  const queryClient = useQueryClient(); // Initialize queryClient for refetching

  const { data: studentsData } = useQuery({
    queryKey: ["students", locale, user?.type],
    queryFn: () =>
      fetchStudents(
        {
          start_date: format(currentWeekStart, "yyyy-MM-dd"),
          user_ids: data?.data?.data?.map((student) => student?.id),
        },
        locale,
        user?.type
      ),
    enabled: user?.type === "teacher",
  });

  const { data: childrenData } = useQuery({
    queryKey: ["children", locale, user?.type],
    queryFn: () =>
      fetchChildren(
        {
          start_date: format(currentWeekStart, "yyyy-MM-dd"),
          user_ids: data?.data?.data?.map((student) => student?.id),
        },
        locale,
        user?.type
      ),
    enabled: user?.type === "parent",
  });

  const { data: usersResponse, error: usersError } = useQuery({
    queryKey: ["students", locale],
    queryFn: () => {
      return fetchUsers({ type: "student" }, locale, user?.type);
    },
    staleTime: 1 * 60 * 1000,
    enabled: user?.type === "admin",
  });

  const data = studentsData || childrenData || usersResponse;

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendance", locale, currentWeekStart, user?.type, resData, importData],
    queryFn: () =>
      fetchAttendance(
        {
          start_date: format(currentWeekStart, "yyyy-MM-dd"),
          user_ids: data?.data?.data?.map((student) => student?.id),
        },
        locale,
        user?.type
      ),
    enabled: data?.data?.data?.length > 0 || user?.type === "student",
  });

  const students = data?.data?.data.map((student) => ({
    ...student,
    date: attendanceData?.data?.start_date,
    attendances: attendanceData?.data?.attendances?.filter((attendance) => attendance?.user?.id === student?.id) || [],
  })) || (attendanceData?.data?.attendances[0]?.user && [{
    ...attendanceData?.data?.attendances[0]?.user,
    date: attendanceData?.data?.start_date,
    attendances: attendanceData?.data?.attendances,
  }]) || [];

  const importAttendanceMutation = useMutation({
    mutationFn: (formData) => importAttendance(formData, locale, user?.type),
    onSuccess: (data) => {
      toast.success(data.message);
      setImportData(data.details);
      setIsImportModalOpen(false);
      setIsResultModalOpen(true); // Open result modal
      queryClient.invalidateQueries({
        queryKey: ["attendance", locale, currentWeekStart, user?.type, resData, importData],
      }); // Refetch attendance
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
      toast.error(errorMessage);
    },
  });

  const handleAttendanceChange = async (student, date, status) => {
    try {
      const response = await createAttendance(
        {
          user_id: student,
          date: format(date, "yyyy-MM-dd"),
          status,
        },
        locale,
        user?.type
      );
      if (response.success) {
        toast.success(response.message);
        setResData(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const dateLocale = locale === "ar" ? arLocale : undefined;

  const days = Array.from({ length: 7 })
    .map((_, i) => addDays(currentWeekStart, i))
    .filter((date) => date.getDay() !== 5 && date.getDay() !== 6);

  const navigateWeek = (direction) => {
    setCurrentWeekStart((prev) =>
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const handleDateSelect = (e) => {
    const selectedDate = parseISO(e.target.value);
    setCurrentWeekStart(getWeekStart(selectedDate));
  };

  const minDate = format(subYears(new Date(), 10), "yyyy-MM-dd");
  const maxDate = format(addYears(new Date(), 10), "yyyy-MM-dd");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader pageTitle={t("attendance_calendar")} backUrl={`/${locale}/dashboard`} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateWeek("prev")}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 font-medium"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                {t("previous")}
              </button>
              <button
                onClick={() => navigateWeek("next")}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 font-medium"
              >
                {t("next")}
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("week_of")} {format(currentWeekStart, "MMM dd, yyyy", { locale: dateLocale })}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {format(currentWeekStart, "EEEE", { locale: dateLocale })} - {format(addDays(currentWeekStart, 4), "EEEE", { locale: dateLocale })}
              </p>
            </div>
            <div className="relative">
              <input
                type="date"
                onChange={handleDateSelect}
                min={minDate}
                max={maxDate}
                className="w-full px-2 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>
        </div>
        {user?.type === "teacher" && (
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-[#0B7459] hover:bg-[#095d47] my-4 transition-colors duration-300 text-white py-2 px-6 rounded-xl font-medium"
          >
            {t("import_students")}
          </button>
        )}
        <ImportAttendanceModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSubmit={(data) => importAttendanceMutation.mutate(data)}
          locale={locale}
        />
        <ImportResultModal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          importData={importData}
          locale={locale}
        />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 w-48">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      {t("student")}
                    </div>
                  </th>
                  {days.map((date) => (
                    <th key={date} className="px-4 py-4 text-center font-semibold text-gray-900 min-w-36">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-600">
                          {format(date, "EEE", { locale: dateLocale })}
                        </span>
                        <span className="text-lg font-semibold">
                          {format(date, "dd", { locale: dateLocale })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(date, "MMM", { locale: dateLocale })}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students?.map((student, index) => (
                  <tr key={student?.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {student?.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{student?.name}</span>
                      </div>
                    </td>
                    {days.map((date) => {
                      const attendance = student?.attendances?.find((attendance) => attendance?.date === format(date, "yyyy-MM-dd"));
                      const currentValue = attendance?.status || "";
                      return (
                        isLoading ? (
                          <td key={`${student?.id}-${date}`} className="px-2">
                            <div className="w-full h-8 bg-gray-100 rounded-xl py-5 animate-pulse"></div>
                          </td>
                        ) : (
                          <td key={`${student?.id}-${date}`} className="px-4 py-5 text-center">
                            {user?.type === "teacher" ? (
                              <select
                                className={`w-full px-3 py-2.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium text-sm cursor-pointer ${
                                  currentValue ? statusColors[currentValue] : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                                value={currentValue}
                                onChange={(e) => handleAttendanceChange(student?.id, date, e.target.value)}
                              >
                                <option value="" className="text-gray-500">{t("select_status")}</option>
                                {options.map((option) => (
                                  <option key={option} value={option} className="text-gray-900">
                                    {t(option)}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className={`font-medium text-gray-900 capitalize text-sm ${statusColors[currentValue]} py-1 px-2 rounded-full`}>{t(currentValue) || t("empty")}</span>
                            )}
                          </td>
                        )
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("status_legend")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {options.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 ${statusColors[option]}`}></div>
                <span className="text-sm font-medium text-gray-700 capitalize">{t(option)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ImportAttendanceModal = ({ isOpen, onClose, onSubmit, locale }) => {
  const t = useTranslations();
  const [file, setFile] = useState(null);
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{t("import_students")}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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


const ImportResultModal = ({ isOpen, onClose, importData, locale }) => {
  const t = useTranslations();

  if (!isOpen || !importData) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <h2 className="text-base font-semibold text-gray-800">{t("import_results")}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 space-y-2 max-h-[65vh] overflow-y-auto">
          {importData.map((result, index) => (
            <ImportResultItem key={index} result={result} t={t} />
          ))}
        </div>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-150"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};


const ImportResultItem = ({ result, t }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSuccess = result.status === "success";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200 group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isSuccess 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            {isSuccess ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {result.name}
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                ID: {result.user_id}
              </span>
              <span className="text-xs text-gray-500">
                {t("row")} {result.row_number}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isSuccess 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isSuccess ? 'Success' : 'Error'}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>
      
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="p-4 space-y-4">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-white rounded-md border border-gray-200">
                <Hash className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("national_id")}
                  </span>
                  <p className="text-sm text-gray-900 font-medium">{result.national_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-md border border-gray-200">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("study_level")}
                  </span>
                  <p className="text-sm text-gray-900 font-medium">{result.study_level_id}</p>
                </div>
              </div>
            </div>

            {/* Message Section */}
            <div className="p-3 bg-white rounded-md border border-gray-200">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("message")}
                  </span>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{result.message}</p>
                </div>
              </div>
            </div>

            {/* Steps Section */}
            {result.steps && result.steps.length > 0 && (
              <div className="p-3 bg-white rounded-md border border-gray-200">
                <div className="flex items-start gap-2">
                  <List className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t("steps")}
                    </span>
                    <ul className="mt-2 space-y-1">
                      {result.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Updates Section */}
            {result.attendance && result.attendance.length > 0 && (
              <div className="p-3 bg-white rounded-md border border-gray-200">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t("attendance_updates")}
                    </span>
                    <ul className="mt-2 space-y-2">
                      {result.attendance.map((update, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 mt-2"></span>
                          <span className="leading-relaxed">{update}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
