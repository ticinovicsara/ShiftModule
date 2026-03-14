import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { ApiEnvelope } from "../types";

const ACCESS_TOKEN_KEY = "shiftmodule.access_token";

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly details: unknown;

  constructor(message: string, statusCode: number, details: unknown) {
    super(message);
    this.name = "ApiClientError";
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

function parseApiError(error: unknown): ApiClientError {
  if (!axios.isAxiosError(error)) {
    return new ApiClientError("Unexpected client error occurred", 0, error);
  }

  const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
  const statusCode = axiosError.response?.status ?? 0;
  const messageFromEnvelope = axiosError.response?.data?.message;
  const message =
    messageFromEnvelope ?? axiosError.message ?? "Unexpected network error";

  return new ApiClientError(message, statusCode, axiosError.response?.data);
}

function unwrapEnvelope<TData>(
  response: AxiosResponse<ApiEnvelope<TData>>,
): TData {
  return response.data.data;
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
      (response) => response,
      (error: unknown) => {
        const parsed = parseApiError(error);

        if (parsed.statusCode === 401) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          if (window.location.pathname !== "/login") {
            window.location.assign("/login");
          }
        }

        if (parsed.statusCode >= 500) {
          throw new ApiClientError(
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
    try {
      const response = await this.instance.get<ApiEnvelope<TData>>(url, {
        params,
      });
      return unwrapEnvelope(response);
    } catch (error) {
      throw parseApiError(error);
    }
  }

  async post<TData>(
    url: string,
    body?: object,
    config?: AxiosRequestConfig,
  ): Promise<TData> {
    try {
      const response = await this.instance.post<ApiEnvelope<TData>>(
        url,
        body,
        config,
      );
      return unwrapEnvelope(response);
    } catch (error) {
      throw parseApiError(error);
    }
  }

  async patch<TData>(url: string, body?: object): Promise<TData> {
    try {
      const response = await this.instance.patch<ApiEnvelope<TData>>(url, body);
      return unwrapEnvelope(response);
    } catch (error) {
      throw parseApiError(error);
    }
  }

  async delete<TData>(url: string): Promise<TData> {
    try {
      const response = await this.instance.delete<ApiEnvelope<TData>>(url);
      return unwrapEnvelope(response);
    } catch (error) {
      throw parseApiError(error);
    }
  }
}

export const client = new ApiClient();
