import { useEffect, useState } from "react";

export type AdminSupportContact = {
  adminName: string | null;
  email: string | null;
  phoneNumber: string | null;
};

type Params = {
  username?: string;
  serialKey?: string;
  token?: string;
};

export function useAdminSupportContact({ username, serialKey, token }: Params) {
  const [contact, setContact] = useState<AdminSupportContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadContact() {
      if (!window.bukolabs?.auth?.getSupportContact) {
        if (!cancelled) setLoading(false);
        return;
      }

      setLoading(true);
      const result = await window.bukolabs.auth.getSupportContact({
        token,
        username: username?.trim() || undefined,
        serialKey: serialKey?.trim() || undefined,
      });

      if (cancelled) return;

      if (result.success && result.contact) {
        setContact(result.contact);
      } else {
        setContact({ adminName: null, email: null, phoneNumber: null });
      }
      setLoading(false);
    }

    void loadContact();
    return () => {
      cancelled = true;
    };
  }, [username, serialKey, token]);

  return { contact, loading };
}
