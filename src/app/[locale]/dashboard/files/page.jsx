"use client"

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import CustomActionFile from "../../../../components/dashboard/CustomActionFile";
import { useTranslations } from "next-intl";
import Image from "next/image";
import DeleteModal from "../../../../components/modals/DeleteModal";
import GenericFileModal from "../../../../components/modals/GenericFileModal"; 
import GlobalToast from "../../../../components/GlobalToast";
import { deleteFile, fetchFiles, uploadFile } from "../../../../lib/api";

const defaultInitialData = {};

const FilesPage = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState({ id: null, name: "" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: files, isLoading, error } = useQuery({
    queryKey: ["files"],
    queryFn: fetchFiles,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["files"]);
      setIsDeleteModalOpen(false);
      let message = t("file_deleted_success");
      if (Array.isArray(data)) {
        message = data[0]?.value?.message || t("file_deleted_success");
      } else {
        message = data?.success ? data.message || t("file_deleted_success") : t("file_deleted_success");
      }
      toast.success(message, {
        position: "bottom-left",
        autoClose: 4000,
      });
    },
    onError: (error) => {
      console.error("خطأ في الحذف:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || t("error_deleting_file"), {
        position: "bottom-left",
        autoClose: 4000,
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["files"]);
      setIsAddModalOpen(false);
      toast.success(data.message || t("file_uploaded_success"), {
        position: "bottom-left",
        autoClose: 4000,
      });
    },
    onError: (error) => {
      console.error("خطأ في رفع الملف:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || t("error_uploading_file"), {
        position: "bottom-left",
        autoClose: 4000,
      });
    },
  });

  const handleOpenDeleteModal = (fileId, fileName) => {
    setFileToDelete({ id: fileId, name: fileName });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(fileToDelete.id);
  };

  const handleAddFile = (formData) => {
    uploadMutation.mutate(formData);
  };

  const isImageFile = (file) => {
    const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    return file.type === "image" && imageExtensions.includes(file.extension.toLowerCase());
  };

  const fieldsConfig = [
    {
      name: "file",
      label: "file",
      type: "file",
      required: true,
    },
  ];

  return (
    <div>
      <DashboardHeader
        pageTitle={t("files")}
        backUrl="/dashboard"
        onAdd={() => setIsAddModalOpen(true)}
      />
      {isLoading ? (
        <p className="p-4">{t("loading")}</p>
      ) : error ? (
        <p className="p-4 text-red-600">{t("error")}</p>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {files?.map((file) => (
            <div
              key={file.id}
              className="bg-gray-50 shadow-sm rounded-lg overflow-hidden relative aspect-square cursor-pointer"
            >
              {isImageFile(file) ? (
                <Image
                  src={file.url}
                  alt={file.original_name}
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                  priority 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-600">{file.extension.toUpperCase()}</span>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <CustomActionFile
                  fileId={file.id}
                  fileName={file.original_name}
                  onOpenDelete={handleOpenDeleteModal}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        userName={fileToDelete.name}
      />
      <GenericFileModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddFile}
        fieldsConfig={fieldsConfig}
        initialData={defaultInitialData} 
        isEdit={false}
      />
      <GlobalToast />
    </div>
  );
};

export default FilesPage;