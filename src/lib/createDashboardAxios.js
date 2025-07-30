  import axios from "axios";
  import Cookies from "js-cookie";

  const createDashboardAxios = (locale = "ar") => {
    const token = Cookies.get("token") || null; 
    const headers = {
      Accept: "application/json",
      "Accept-Language": locale,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return axios.create({
      baseURL: "https://hafez.share.net.sa/api",
      headers,
    });
  };

  export default createDashboardAxios;