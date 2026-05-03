import axios from "axios";

const API = axios.create({
  baseURL: "http://10.166.64.249:8080/api/auth", // change if real device
});

export const registerUser = (data: any) => {
  return API.post("/register", data);
};

export const loginUser = (data: any) => {
  return API.post("/login", data);
};

export const googleLogin = (token: string) => {
  return API.post("/google", { token });
};