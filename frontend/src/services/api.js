import axios from "axios";

const API_URL = "https://loopgen.onrender.com/api";
//const API_URL = "http://localhost:5000/api";

export default axios.create({
  baseURL: API_URL,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});
