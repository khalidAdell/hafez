"use client";

import React, { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  isSaturday,
  parseISO,
  subYears,
  addYears
} from "date-fns";
import { ar as arLocale } from "date-fns/locale"; // Import Arabic locale
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import { useLocale, useTranslations } from "next-intl";
import { fetchAttendance, createAttendance, fetchStudents, fetchUsers, fetchChildren } from "../../../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../../../context/userContext";
import { toast } from "react-toastify";

const options = ["present", "late", "absent", "absent_excused"];

const statusColors = {
  "present": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "late": "bg-amber-100 text-amber-800 border-amber-200", 
  "absent": "bg-red-100 text-red-800 border-red-200",
  "absent_excused": "bg-blue-100 text-blue-800 border-blue-200"
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
  const {user} = useUser();
  const [resData, setResData] = useState(null);

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
    enabled: user?.type == "teacher",
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
    enabled: user?.type == "parent",
  });


  const { data: usersResponse, error: usersError } = useQuery({
    queryKey: ["students", locale],
    queryFn: () => {
      return fetchUsers({ type: "student" }, locale, user?.type);
    },
    staleTime: 1 * 60 * 1000,
    enabled: user?.type == "admin",
  });

  const data = studentsData || childrenData || usersResponse;

  const { data: attendanceData,isLoading } = useQuery({
    queryKey: ["attendance", locale, currentWeekStart, user?.type, resData],
    queryFn: () =>
      fetchAttendance(
        {
          start_date: format(currentWeekStart, "yyyy-MM-dd"),
          user_ids: data?.data?.data?.map((student) => student?.id),
        },
        locale,
        user?.type
      ),
    enabled: data?.data?.data?.length > 0 || user?.type == "student",
  });

  const students = data?.data?.data.map((student) => ({
    ...student,
    date: attendanceData?.data?.start_date,
    attendances: attendanceData?.data?.attendances?.filter((attendance) => attendance?.user?.id === student?.id) || [],
  })) ||(attendanceData?.data?.attendances[0]?.user&& [{...attendanceData?.data?.attendances[0]?.user,
    date: attendanceData?.data?.start_date,
    attendances: attendanceData?.data?.attendances,
  }]) || [];
  console.log(students);
  
   
  
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
  // Use Arabic locale for date-fns if locale is 'ar'
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
            {/* Week Navigation */}
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

            {/* Week Title */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("week_of")} {format(currentWeekStart, "MMM dd, yyyy", { locale: dateLocale })}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {format(currentWeekStart, "EEEE", { locale: dateLocale })} - {format(addDays(currentWeekStart, 4), "EEEE", { locale: dateLocale })}
              </p>
            </div>

            {/* Date Picker */}
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

        {/* Attendance Table */}
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
                        isLoading ?   <td key={`${student?.id}-${date}`} className="px-2">
                          <div className="w-full h-8 bg-gray-100 rounded-xl py-5 animate-pulse"></div>
                        </td> :
                        <td key={`${student?.id}-${date}`} className="px-4 py-5 text-center">
                          {user?.type == "teacher" ?
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
                                {option}
                              </option>
                            ))}
                          </select>
                         :
                        <span className={`font-medium text-gray-900 capitalize text-sm ${statusColors[currentValue]} py-1 px-2 rounded-full`}>{currentValue || t("empty")}</span>
                        }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("status_legend")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {options.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 ${statusColors[option]}`}></div>
                <span className="text-sm font-medium text-gray-700 capitalize">{option}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}