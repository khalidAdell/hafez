import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomFilePicker from "../../../../components/CustomFilePicker";
import { useTranslations } from "next-intl";

const defaultState = {
  name: "",
  email: "",
  phone: "",
  type: "student",
  user_img: "",
  city_id: "",
  district_id: "",
  gender: "male",
  status: "active",
  password: "",
  password_confirmation: "",
  age: "",
  job: "",
  study_level_id: "",
  session_id: "",
  parent_id: "",
  national_id: "",
};

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
  cities = [],
  districts = [],
  studyLevels = [],
  sessions = [],
  parents = [],
  locale = "ar",
  setCityId,
}) {
  const [form, setForm] = useState(defaultState);
  const [errors, setErrors] = useState({});
    const t = useTranslations();
  useEffect(() => {
    setForm({ ...defaultState, ...initialData });
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let val = type === "file" ? files[0] : value;
    setForm((prev) => {
      const updated = { ...prev, [name]: val };
      if (name === "city_id") {
        updated.district_id = "";
        setCityId && setCityId(val);
      }
      return updated;
    });
  };

  // Handle CustomFilePicker change
  const handleFileChange = (name, _file, imageId, imageUrl) => {
    setForm((prev) => ({
      ...prev,
      user_img: imageId,
      image_url: imageUrl,
    }));
  };


  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < (isEdit ? 4 : 3)) errs.name = "الاسم مطلوب";
    if (!form.email) errs.email = "البريد الإلكتروني مطلوب";
    if (!form.phone) errs.phone = "رقم الهاتف مطلوب";
    if (!form.user_img) errs.user_img = "الصورة مطلوبة";
    if (!form.city_id && form.type !== "admin") errs.city_id = "المدينة مطلوبة";
    if (!form.district_id && form.type !== "admin") errs.district_id = "الحي مطلوب";
    if (!form.gender) errs.gender = "الجنس مطلوب";
    if (!form.type) errs.type = "النوع مطلوب";
    if (!isEdit) {
      if (!form.password || form.password.length < 6) errs.password = "كلمة المرور مطلوبة (6 أحرف على الأقل)";
      if (form.password !== form.password_confirmation) errs.password_confirmation = "تأكيد كلمة المرور غير متطابق";
      if (!form.age) errs.age = "تاريخ الميلاد مطلوب";
    }
    if (form.type === "teacher" && !form.job) errs.job = "الوظيفة مطلوبة";
    if (form.type === "student") {
      if (!(form.study_level_id || form?.study_level?.id)) errs.study_level_id = "المستوى الدراسي مطلوب";
      if (!(form.session_id || form?.session?.id)) errs.session_id = "الجلسة مطلوبة";
      if (!(form.parent_id || form?.parent?.id)) errs.parent_id = "ولي الأمر مطلوب";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("يرجى تصحيح الأخطاء قبل الإرسال");
      return;
    }
    // Build FormData
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("type", form.type);
    fd.append("user_img", form.user_img);
    fd.append("city_id", form.city_id);
    fd.append("district_id", form.district_id);
    fd.append("gender", form.gender);
    fd.append("status", form.status);
    fd.append("national_id", form.national_id);
    if (!isEdit) {
      fd.append("password", form.password);
      fd.append("password_confirmation", form.password_confirmation);
      fd.append("age", form.age);
    } else {
      fd.append("_method", "PUT");
    }
    if (form.type === "teacher") fd.append("job", form.job);
    if (form.type === "student") {
      fd.append("study_level_id", form.study_level_id || form?.study_level?.id);
      fd.append("user_session_id", form.session_id || form?.session?.id);
      fd.append("parent_id", form.parent_id || form?.parent?.id);
    }
    onSubmit(fd);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute w-full h-full bg-black/50"
      onClick={onClose}></div>
      <form
        className="bg-white max-h-[90%] overflow-auto p-8 rounded-xl w-full max-w-2xl shadow-lg space-y-6 relative"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="absolute top-4 left-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-center mb-6 text-[#0B7459]">
          {isEdit ? "تعديل مستخدم" : "إضافة مستخدم"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">الاسم</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block mb-1 font-medium">البريد الإلكتروني</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
          </div>
          <div>
            <label className="block mb-1 font-medium">رقم الهاتف</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
            {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
          </div>
          <div>
            <label className="block mb-1 font-medium">الصورة</label>
            <CustomFilePicker
              name="user_img"
              onFileChange={handleFileChange}
              locale={locale}
              imageUrl={form.image_url}
              imageId={form.user_img}
            />
            {errors.user_img && <div className="text-red-500 text-xs mt-1">{errors.user_img}</div>}
          </div>
          <div>
            <label className="block mb-1 font-medium">المدينة</label>
            <select name="city_id" value={form.city_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]">
              <option value="">اختر المدينة</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
            {errors.city_id && <div className="text-red-500 text-xs mt-1">{errors.city_id}</div>}
          </div>
          <div>
            <label className="block mb-1 font-medium">الحي</label>
            <select name="district_id" value={form.district_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]">
              <option value="">اختر الحي</option>
              {districts.filter(d => d.city_id == form.city_id).map((district) => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
            {errors.district_id && <div className="text-red-500 text-xs mt-1">{errors.district_id}</div>}
          </div>
          <div>
            <label className="block mb-1 font-medium">الجنس</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]">
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
            {errors.gender && <div className="text-red-500 text-xs mt-1">{errors.gender}</div>}
          </div>
          <div>
            <label className="block mb-1 font-medium">النوع</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]">
              <option value="student">طالب</option>
              <option value="admin">مشرف</option>
              <option value="teacher">معلم</option>
              <option value="parent">ولي أمر</option>
            </select>
            {errors.type && <div className="text-red-500 text-xs mt-1">{errors.type}</div>}
          </div>
          {!isEdit && (
            <>
              <div>
                <label className="block mb-1 font-medium">كلمة المرور</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
                {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium">تأكيد كلمة المرور</label>
                <input name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
                {errors.password_confirmation && <div className="text-red-500 text-xs mt-1">{errors.password_confirmation}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium">تاريخ الميلاد</label>
                <input name="age" type="date" value={form.age} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
                {errors.age && <div className="text-red-500 text-xs mt-1">{errors.age}</div>}
              </div>
            </>
          )}
          {form.type === "teacher" && (
            <div>
              <label className="block mb-1 font-medium">الوظيفة</label>
              <input name="job" value={form.job} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
              {errors.job && <div className="text-red-500 text-xs mt-1">{errors.job}</div>}
            </div>
          )}
          {form.type === "student" && (
            <>
              <div>
                <label className="block mb-1 font-medium">المستوى الدراسي</label>
                <select name="study_level_id" value={form.study_level_id || form?.study_level?.id || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]">
                  <option value="">اختر المستوى</option>
                  {studyLevels.map((level) => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
                {errors.study_level_id && <div className="text-red-500 text-xs mt-1">{errors.study_level_id}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium">الجلسة</label>
                <select name="session_id" value={form.session_id || form?.session?.id || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]">
                  <option value="">اختر الجلسة</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>{session.name}</option>
                  ))}
                </select>
                {errors.session_id && <div className="text-red-500 text-xs mt-1">{errors.session_id}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium">ولي الأمر</label>
                <select name="parent_id" value={form.parent_id || form?.parent?.id || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]">
                  <option value="">اختر ولي الأمر</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  ))}
                </select>
                {errors.parent_id && <div className="text-red-500 text-xs mt-1">{errors.parent_id}</div>}
              </div>
            </>
          )}
            <div>
                <label className="block mb-1 font-medium">الحالة</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]">
                  <option value="">اختر الحالة</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
                {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
              </div>
            <div>
                <label className="block mb-1 font-medium">الرقم الوطني</label>
                <input name="national_id" placeholder="10 ارقام" value={form.national_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7459]" />
                {errors.national_id && <div className="text-red-500 text-xs mt-1">{errors.national_id}</div>}
              </div>
        </div>
        <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B7459] text-white rounded-lg hover:bg-[#096a4d]"
            >
              {isEdit ? t("update") : t("add")}
            </button>
          </div>
      </form>
    </div>
  );
}
