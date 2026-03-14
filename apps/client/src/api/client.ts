import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import { ROUTE_PATHS } from "../constants";
import type { ApiEnvelope } from "../types";

const ACCESS_TOKEN_KEY = "shiftmodule.access_token";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details: unknown;

  constructor(message: string, statusCode: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

function getApiBaseUrl() {
  return (
    (import.meta.env.VITE_API_URL as string | undefined) ??
    "http://localhost:3000"
  );
}

function parseApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError("Unexpected client error occurred", 0, error);
  }

  const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
  const statusCode = axiosError.response?.status ?? 0;
  const messageFromEnvelope = axiosError.response?.data?.message;
  const message =
    messageFromEnvelope ?? axiosError.message ?? "Unexpected network error";

  return new ApiError(message, statusCode, axiosError.response?.data);
}

function isApiEnvelope<TData>(value: unknown): value is ApiEnvelope<TData> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "data" in value && "message" in value && "error" in value;
}

class ApiClient {
  private readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: getApiBaseUrl(),
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: false,
    });

    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    this.instance.interceptors.response.use(
      (response) => {
        const payload = response.data;
        if (isApiEnvelope<unknown>(payload)) {
          return payload.data;
        }

        return payload;
      },
      (error: unknown) => {
        const parsed = parseApiError(error);

        if (parsed.statusCode === 401) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          if (window.location.pathname !== ROUTE_PATHS.login) {
            window.location.assign(ROUTE_PATHS.login);
          }
        }

        if (parsed.statusCode >= 500) {
          throw new ApiError(
            "Server error occurred. Please try again later.",
            parsed.statusCode,
            parsed.details,
          );
        }

        throw parsed;
      },
    );
  }

  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  async get<TData>(url: string, params?: object): Promise<TData> {
    const response = await this.instance.get<TData>(url, { params });
    return response;
  }

  async post<TData>(
    url: string,
    body?: object,
    config?: AxiosRequestConfig,
  ): Promise<TData> {
    const response = await this.instance.post<TData>(url, body, config);
    return response;
  }

  async patch<TData>(url: string, body?: object): Promise<TData> {
    const response = await this.instance.patch<TData>(url, body);
    return response;
  }

  async delete<TData>(url: string): Promise<TData> {
    const response = await this.instance.delete<TData>(url);
    return response;
  }
}

export const client = new ApiClient();
