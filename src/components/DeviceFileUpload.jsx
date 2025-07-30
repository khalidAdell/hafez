import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const DeviceFileUpload = ({ name, onFileChange, initialImage = "" }) => {
  const t = useTranslations();
  const [preview, setPreview] = useState(initialImage);
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    setPreview(initialImage);
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [initialImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      const newObjectUrl = URL.createObjectURL(file);
      setObjectUrl(newObjectUrl);
      setPreview(newObjectUrl);
      onFileChange(name, file);
    } else {
      setPreview(initialImage);
      onFileChange(name, null);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {preview && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">{t("preview")}</p>
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg mb-2"
          />
        </div>
      )}
      <input
        type="file"
        name={name}
        onChange={handleFileChange}
        accept="image/*"
        className="w-full p-2 border border-gray-300 rounded-lg"
      />
    </div>
  );
};

export default DeviceFileUpload;