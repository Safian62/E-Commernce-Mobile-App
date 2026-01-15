import axios from "axios";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useApi = () => {
  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync("mobile_token");

      if (token) {
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  return api;
};

