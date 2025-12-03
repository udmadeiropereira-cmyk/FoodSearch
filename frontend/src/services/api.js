import axios from "axios";

const api = axios.create({
  baseURL: "https://foodsearch-api.onrender.com",
});

export default api;