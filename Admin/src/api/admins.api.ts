import api from "./axios";

export type AdminProfile = {
  adminId: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  company?: string | null;
};

export const adminsApi = {
  update: (
    adminId: number,
    body: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      password: string;
    }>,
  ) => api.patch<AdminProfile>(`/admins/${adminId}`, body).then((r) => r.data),
};
