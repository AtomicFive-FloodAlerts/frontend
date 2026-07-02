import axios from "axios";
import { Platform } from "react-native";

const host =
  Platform.OS === "web"
    ? "localhost"
    : process.env.EXPO_PUBLIC_API_HOST;

const API = axios.create({
  baseURL: `http://${host}:8080/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = (data: any) => API.post("/register", data);
export const loginUser = (data: any) => API.post("/login", data);

export default API;