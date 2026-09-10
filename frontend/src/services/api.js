import axios from "axios";

const API_URL = "https://loopgen.onrender.com/api";

export default axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
