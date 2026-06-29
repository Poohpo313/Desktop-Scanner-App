export type UserRole = "superadmin" | "admin" | "user";

export interface JwtPayload {
  sub: number;
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  role: UserRole;
  userId: number;
}
