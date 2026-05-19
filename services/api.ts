import axios from "axios";

const API = axios.create({
  baseURL: `http://${process.env.EXPO_PUBLIC_MY_IP}:8080/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (data: any) => {
  return await API.post("/register", data);
};

export const loginUser = async (data: any) => {
  return await API.post("/login", data);
};

export default API;