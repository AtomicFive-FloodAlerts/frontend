import axios from "axios";

const API = axios.create({
  baseURL: "http://10.55.106.249:8080/api/auth",
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

export const googleLogin = async (token: string) => {
  return await API.post("/google", { token });
};

export default API;