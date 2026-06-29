export type UserRole = "admin" | "superadmin" | "user";

export type JwtPayload = {
  sub: number;
  username: string;
  role: UserRole;
  /** Present on admin tokens — assigned company scope (server-derived, never trust client). */
  company?: string;
  /** Present on admin tokens — assigned department scope. */
  department?: string;
};

export type LoginResponse = {
  accessToken: string;
  role: UserRole;
  userId: number;
};
