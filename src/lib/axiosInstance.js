import axios from "axios";

const createAxiosInstance = (locale = "ar") => {
  return axios.create({
    baseURL: "https://7afez.share.net.sa/api",
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
  });
};

export default createAxiosInstance;
