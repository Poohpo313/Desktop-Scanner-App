import api from "./axios";

export type UserConcernRow = {
  id: number;
  userId: number | null;
  username: string;
  concernType: string;
  category: string;
  subject: string;
  message: string;
  email: string | null;
  rating: number | null;
  company: string | null;
  department: string | null;
  status: string;
  timestamp: string;
};

export const userConcernsApi = {
  list: () => api.get<UserConcernRow[]>("/user-concerns").then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    api.patch<UserConcernRow>(`/user-concerns/${id}/status`, { status }).then((r) => r.data),
};
