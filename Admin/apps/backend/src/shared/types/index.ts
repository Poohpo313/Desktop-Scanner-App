export type UserRole = "admin" | "superadmin" | "user";

export type JwtPayload = {
  sub: number;
  username: string;
  role: UserRole;
};

export type LoginResponse = {
  accessToken: string;
  role: UserRole;
  userId: number;
};
