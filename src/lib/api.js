import { useQuery } from "@tanstack/react-query";
import createDashboardAxios from "./createDashboardAxios";

export const fetchUsers = async (params = {}, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get("/admin/users", { params });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات المستخدمين");
    }
  } catch (error) {
    console.error("خطأ في جلب المستخدمين:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const addUser = async (userData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.post("/admin/users", userData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل إضافة المستخدم");
    }
  } catch (error) {
    console.error("خطأ في إضافة المستخدم:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateUser = async (userId, userData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.post(`/admin/users/${userId}`, userData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل تعديل المستخدم");
    }
  } catch (error) {
    console.error("خطأ في تعديل المستخدم:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const deleteUser = async (userId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل حذف المستخدم");
    }
  } catch (error) {
    console.error("خطأ في حذف المستخدم:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchCities = async (params = {}, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get("/admin/cities", { params });
    if (response.data.success) {
      return response.data; 
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات المدن");
    }
  } catch (error) {
    console.error("خطأ في جلب المدن:", error.response?.data?.message || error.message);
    throw error;
  }
};


export const addCity = async (cityData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const formData = new FormData();
    formData.append("name_ar", cityData.get("name_ar") || "");
    formData.append("name_en", cityData.get("name_en") || "");
    formData.append("status", cityData.get("status") || "active");
    if (cityData.get("image")) {
      formData.append("image", cityData.get("image")); // إرسال image_id تحت اسم image
    }

    // لوغ للتحقق من البيانات
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await axiosInstance.post("/admin/cities", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل إضافة المدينة");
    }
  } catch (error) {
    console.error("خطأ في إضافة المدينة:", error.response?.data || error.message);
    throw error;
  }
};

export const updateCity = async (id, cityData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const formData = new FormData();
    formData.append("name_ar", cityData.get("name_ar") || "");
    formData.append("name_en", cityData.get("name_en") || "");
    formData.append("status", cityData.get("status") || "active");
    if (cityData.get("image")) {
      formData.append("image", cityData.get("image")); 
    }
    formData.append("_method", "PUT");

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await axiosInstance.post(`/admin/cities/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل تعديل المدينة");
    }
  } catch (error) {
    console.error("خطأ في تعديل المدينة:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteCity = async (cityId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.delete(`/admin/cities/${cityId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل حذف المدينة");
    }
  } catch (error) {
    console.error("خطأ في حذف المدينة:", error.response?.data?.message || error.message);
    throw error;
  }
};
export const fetchCityById = async (cityId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get(`/admin/cities/${cityId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات المدينة");
    }
  } catch (error) {
    console.error("خطأ في جلب بيانات المدينة:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchDistricts = async (cityId = "", locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const params = cityId ? { city_id: cityId } : {};
    const response = await axiosInstance.get("/admin/districts", { params });
    if (response.data.success) {
      return response.data.data.data;
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات الأحياء");
    }
  } catch (error) {
    console.error("خطأ في جلب الأحياء:", error.response?.data?.message || error.message);
    throw error;
  }
};
export const addDistrict = async (districtData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const formData = new FormData();
    formData.append("name_ar", districtData.get("name_ar") || "");
    formData.append("name_en", districtData.get("name_en") || "");
    formData.append("status", districtData.get("status") || "active");
    formData.append("city_id", districtData.get("city_id") || "");

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await axiosInstance.post("/admin/districts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل إضافة الحي");
    }
  } catch (error) {
    console.error("خطأ في إضافة الحي:", error.response?.data || error.message);
    throw error;
  }
};

export const updateDistrict = async (id, districtData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const formData = new FormData();
    formData.append("name_ar", districtData.get("name_ar") || "");
    formData.append("name_en", districtData.get("name_en") || "");
    formData.append("status", districtData.get("status") || "active");
    formData.append("city_id", districtData.get("city_id") || "");
    formData.append("_method", "PUT");

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await axiosInstance.post(`/admin/districts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل تعديل الحي");
    }
  } catch (error) {
    console.error("خطأ في تعديل الحي:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteDistrict = async (districtId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.delete(`/admin/districts/${districtId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل حذف الحي");
    }
  } catch (error) {
    console.error("خطأ في حذف الحي:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchDistrictById = async (districtId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get(`/admin/districts/${districtId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات الحي");
    }
  } catch (error) {
    console.error("خطأ في جلب بيانات الحي:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchAssociations = async (params = {}, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get("/admin/associations", { params });
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات الجمعيات");
    }
  } catch (error) {
    console.error("خطأ في جلب الجمعيات:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const addAssociation = async (associationData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.post("/admin/associations", associationData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل إضافة الجمعية");
    }
  } catch (error) {
    console.error("خطأ في إضافة الجمعية:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateAssociation = async (associationId, associationData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.post(`/admin/associations/${associationId}`, associationData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل تعديل الجمعية");
    }
  } catch (error) {
    console.error("خطأ في تعديل الجمعية:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const deleteAssociation = async (associationId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.delete(`/admin/associations/${associationId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل حذف الجمعية");
    }
  } catch (error) {
    console.error("خطأ في حذف الجمعية:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchMosques = async (params = {}, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get("/admin/mosques", { params });
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات المساجد");
    }
  } catch (error) {
    console.error("خطأ في جلب المساجد:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const addMosque = async (mosqueData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.post("/admin/mosques", mosqueData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل إضافة المسجد");
    }
  } catch (error) {
    console.error("خطأ في إضافة المسجد:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateMosque = async (mosqueId, mosqueData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.post(`/admin/mosques/${mosqueId}`, mosqueData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل تعديل المسجد");
    }
  } catch (error) {
    console.error("خطأ في تعديل المسجد:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const deleteMosque = async (mosqueId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.delete(`/admin/mosques/${mosqueId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل حذف المسجد");
    }
  } catch (error) {
    console.error("خطأ في حذف المسجد:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchSessions = async (params = {}, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get("/admin/sessions", { params });
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات الحلقات");
    }
  } catch (error) {
    console.error("خطأ في جلب الحلقات:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const addSession = async (sessionData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.post("/admin/sessions", sessionData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل إضافة الحلقة");
    }
  } catch (error) {
    console.error("خطأ في إضافة الحلقة:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateSession = async (sessionId, sessionData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.post(`/admin/sessions/${sessionId}`, sessionData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل تعديل الحلقة");
    }
  } catch (error) {
    console.error("خطأ في تعديل الحلقة:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const deleteSession = async (sessionId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.delete(`/admin/sessions/${sessionId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل حذف الحلقة");
    }
  } catch (error) {
    console.error("خطأ في حذف الحلقة:", error.response?.data?.message || error.message);
    throw error;
  }
};



export const fetchFiles = async (params = {}, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get("/file-manager", { params });
    if (response.data.success) {
      return response.data.data.data;
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات الملفات");
    }
  } catch (error) {
    console.error("خطأ في جلب الملفات:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchFileDetails = async (fileId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get(`/file-manager/${fileId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل جلب بيانات الملف");
    }
  } catch (error) {
    console.error("خطأ في جلب تفاصيل الملف:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const deleteFile = async (fileId, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.delete(`/file-manager/${fileId}`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "فشل حذف الملف");
    }
  } catch (error) {
    console.error("خطأ في حذف الملف:", error.response?.data?.message || error.message);
    throw error;
  }
};


export const uploadFile = async (formData, locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.post("/file-manager", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.success) {
      return { message: response.data.message, data: response.data.data };
    } else {
      throw new Error(response.data.message || "فشل رفع الملف");
    }
  } catch (error) {
    console.error("خطأ في رفع الملف:", error.response?.data?.message || error.message);
    throw error;
  }
};