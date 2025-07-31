
import createDashboardAxios from "./createDashboardAxios";

export const fetchDashboardData = async (locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get("/admin/home");

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error("فشل جلب بيانات الصفحة الرئيسية");
    }
  } catch (error) {
    console.error("خطأ في جلب بيانات الصفحة الرئيسية:", error);
    throw error;
  }
};
