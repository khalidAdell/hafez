import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ImagePickerModal from "./modals/ImagePickerModal";
import { useQuery } from "@tanstack/react-query";
import { fetchFiles } from "../lib/api";

const CustomFilePicker = ({
  name,
  onFileChange,
  locale,
  imageUrl,
  imageId,
}) => {
  const t = useTranslations();
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(imageId || null);
  const [previewImageUrl, setPreviewImageUrl] = useState(imageUrl || null);

  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ["images", locale],
    queryFn: () => fetchFiles({ type: "image" }, locale).then((res) => res),
    staleTime: 5 * 60 * 1000,
  });
  useEffect(() => {
    setPreviewImageUrl(imageUrl || null);
  }, [imageUrl]);

  const handleImageSelect = ({ id, url }) => {
    setSelectedImageId(id);
    setPreviewImageUrl(url);
    onFileChange(name, null, id, url);
    setIsImagePickerOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {(previewImageUrl||imageId) && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">{t("current_image")}:</p>
          <img
            src={previewImageUrl || images.find((img) => img.id == imageId)?.url }
            alt="Selected city"
            className="w-24 h-24 object-cover rounded mt-1"
            onClick={() => setIsImagePickerOpen(true)}
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsImagePickerOpen(true)}
        className="w-full p-2 bg-[#0B7459] text-white rounded-lg hover:bg-[#096a4d] text-sm"
      >
        {selectedImageId
          ? t("image_selected") + ` (ID: ${selectedImageId})`
          : t("select_from_files")}
      </button>
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={handleImageSelect}
        locale={locale}
        images={images}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default CustomFilePicker;
