import React from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { fetchFiles } from "../../lib/api";

const ImagePickerModal = ({ isOpen, onClose, onSelect, locale }) => {
  const t = useTranslations();

  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ["images", locale],
    queryFn: () => fetchFiles({ type: "image" }, locale).then((res) => res),
    staleTime: 5 * 60 * 1000,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#0B7459] mb-4">{t("select_image")}</h2>
        {isLoading && <p className="text-center">{t("loading")}</p>}
        {error && <p className="text-red-500 text-center">{t("error_loading_images")}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-md"
              onClick={() => {
                onSelect({ id: image.id, url: image.url }); 
                onClose();
              }}
            >
              <img
                src={image.url}
                alt={image.original_name}
                className="w-full h-32 object-cover"
              />
              <p className="p-2 text-sm text-center truncate">{image.original_name}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePickerModal;