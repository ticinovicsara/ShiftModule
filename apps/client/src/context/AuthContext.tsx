import type { LoginRequestDto, LoginResponseData, User } from "@repo/types";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api";
import { ACCESS_TOKEN_KEY, decodeJwtPayload, toUser } from "../utils";

export interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequestDto) => Promise<LoginResponseData>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    const payload = decodeJwtPayload(savedToken);
    if (!payload) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    setUser(toUser(payload));
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequestDto) => {
    const response = await authApi.login(credentials);
    const payload = decodeJwtPayload(response.token);

    localStorage.setItem(ACCESS_TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(payload ? toUser(payload) : response.user);

    return response;
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? null;

    return {
      user,
      token,
      role,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      logout,
    };
  }, [isLoading, login, logout, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
