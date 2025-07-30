import createDashboardAxios from "./createDashboardAxios";

export const fetchBestStudents = async (locale = "ar") => {
  try {
    const axiosInstance = createDashboardAxios(locale);
    const response = await axiosInstance.get("/admin/home");
    if (response.data.success) {
      return response.data.data.best_students;
    } else {
      throw new Error("فشل جلب بيانات أفضل الطلاب");
    }
  } catch (error) {
    console.error("خطأ في جلب أفضل الطلاب:", error);
    throw error;
  }
};