"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import { toast } from "react-toastify";
import createDashboardAxios from "../../lib/createDashboardAxios";

export default function CustomActionFile({ fileId, fileName, onOpenDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations();

  const handleDownload = async () => {
    try {
      const axiosInstance = createDashboardAxios("ar");
   
      const response = await axiosInstance.get(`/file-manager/${fileId}/download`, {
        responseType: "blob",
      });
const contentType = response.headers['content-type'] || 'application/octet-stream';
const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsOpen(false);
      toast.success(t("file_downloaded"));
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

 
  const handleDelete = () => {
    onOpenDelete(fileId, fileName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <IoEllipsisVertical className="h-5 w-5 text-gray-600" />
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-200 z-10">
          <button
            onClick={handleDownload}
            className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {t("download-file")}
          </button>
       
          <button
            onClick={handleDelete}
            className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            {t("delete-file")}
          </button>
        </div>
      )}
    </div>
  );
}