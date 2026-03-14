import { client } from "./client";
import { API_ENDPOINTS } from "../constants";
import type { LoginRequestDto, LoginResponseData } from "../types";

export const authApi = {
  login: (body: LoginRequestDto) =>
    client.post<LoginResponseData>(API_ENDPOINTS.auth.login, body),
};
