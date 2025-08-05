"use client";
import React from "react";
import { useLocale } from "next-intl";

export default function DashboardTable({ columns = [], data = [] }) {
  const locale = useLocale();
  const isArabic = locale === "ar";

  if (!columns.length || !data.length) {
    return (
      <div className="text-center text-gray-600 p-4">
      </div>
    );
  }


  return (
    <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-sm min-w-[7rem] truncate font-semibold text-gray-600 uppercase tracking-wider ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-50 divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-100">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-800 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {column.accessor === "status" ? (
                    <span
                      className={`px-2 py-1 inline-flex text-sm leading-5 font-medium rounded-full
                        ${
                          row[column.accessor] === "نشط" ||
                          row[column.accessor] === "حضور" ||
                          row[column.accessor] === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                      {row[column.accessor]}
                    </span>
                  ) : column.render ? (
                    column.render(row)
                  ) : (
                    row[column.accessor]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
