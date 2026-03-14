import type { User } from "@repo/types";
import { UserRole } from "@repo/types";

export const ACCESS_TOKEN_KEY = "shiftmodule.access_token";

export interface JwtPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  exp?: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      "=",
    );
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as JwtPayload;

    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function toUser(payload: JwtPayload): User {
  return {
    id: payload.id,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
  };
}