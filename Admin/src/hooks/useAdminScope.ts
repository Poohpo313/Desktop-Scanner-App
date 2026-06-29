import { useCallback, useEffect, useState } from "react";
import { authApi } from "../api/auth.api";
import type { AdminScope } from "../lib/adminPortalMappers";

const emptyScope: AdminScope = {
  userId: 0,
  username: "",
  company: "",
  department: "",
  departments: [],
};

export function useAdminScope() {
  const [scope, setScope] = useState<AdminScope>(emptyScope);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await authApi.me();
      setScope({
        userId: profile.userId,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        company: profile.company ?? "",
        department: profile.department ?? "",
        departments:
          profile.departments?.filter(Boolean) ??
          (profile.department ? [profile.department] : []),
      });
    } catch {
      setScope(emptyScope);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { scope, loading, reloadScope: reload };
}
