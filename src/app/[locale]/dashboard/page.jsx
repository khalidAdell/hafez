"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { fetchDashboardData } from "../../../lib/fetchDashboardData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardHome() {
  const t = useTranslations();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    parents: 0,
    mosques: 0,
    sessions: 0, // Changed from associations to sessions
    employees: 0,
  });
  const [bestStudents, setBestStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const { counts, best_students } = await fetchDashboardData();
        setStats({
          students: counts.students,
          teachers: counts.teachers,
          parents: counts.parents,
          mosques: counts.mosques,
          sessions: counts.sessionsCount || 0,
          employees: counts.admins || 0,
        });
        setBestStudents(best_students);
      } catch (error) {
        setError(t("error"));
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [t]);

  const data = {
    labels: [
      t("students"),
      t("teachers"),
      t("parents"),
      t("mosques"),
      t("sessions"),
      t("employees"),
    ],
    datasets: [
      {
        label: t("statistics"),
        data: [
          stats.students,
          stats.teachers,
          stats.parents,
          stats.mosques,
          stats.sessions, 
          stats.employees,
        ],
        backgroundColor: [
          "rgb(3, 166, 161)",
          "rgb(255, 79, 15)",
          "rgb(3, 166, 161)",
          "rgb(255, 79, 15)",
          "rgba(22,163,74,0.85)",
          "rgb(255, 227, 187)",
        ],
        borderRadius: 8,
        maxBarThickness: 48,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: t("statistics"),
        font: { size: 26, weight: "700" },
        padding: { bottom: 24 },
        color: "#059669",
      },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 100,
          font: { size: 14, weight: "600" },
          color: "#065f46",
        },
        grid: {
          color: "rgba(16, 185, 129, 0.15)",
          borderDash: [6, 3],
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          font: { size: 16, weight: "600" },
          color: "#10b981",
        },
        grid: { display: false },
      },
    },
  };

  const labelsMap = {
    students: t("students"),
    teachers: t("teachers"),
    parents: t("parents"),
    mosques: t("mosques"),
    sessions: t("sessions"), 
    employees: t("employees"),
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-500">{t("loading")}</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 max-sm:p-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="bg-white text-[#0B7459] rounded-2xl shadow-xl p-8 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-2xl duration-300"
            aria-label={labelsMap[key]}
          >
            <p className="text-lg font-semibold mb-4">{labelsMap[key]}</p>
            <p className="text-5xl font-extrabold drop-shadow-lg">{value}</p>
          </div>
        ))}
      </div>

      <div
        className="bg-white rounded-2xl shadow-xl p-10 mb-16 h-[480px] max-sm:h-[300px]"
        aria-label={t("statistics_chart")}
      >
        <Bar options={options} data={data} />
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-10 max-sm:p-4">
        <h2 className="text-2xl font-bold text-[#059669] mb-8">{t("best_students")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestStudents.length > 0 ? (
            bestStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={student.profile_picture}
                  alt={t("profile_picture", { name: student.name })}
                  className="w-14 h-14 rounded-full mx-2"
                />
                <div className="mx-2">
                  <p className="text-lg font-semibold text-[#0B7459]">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                  <p className="text-xs text-gray-500">
                    {t("last_updated")}: {student.updated_at_human}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              {t("no_students_found")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}