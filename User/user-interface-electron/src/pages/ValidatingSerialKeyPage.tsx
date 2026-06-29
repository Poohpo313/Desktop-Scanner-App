import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ValidatingSerialKeyScreen } from "../components/auth/ValidatingSerialKeyScreen";
import { useSession } from "../context/SessionContext";

type ActivationState = {
  serialKey: string;
  username: string;
};

export default function ValidatingSerialKeyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveSession } = useSession();
  const ran = useRef(false);
  const state = location.state as ActivationState | null;

  useEffect(() => {
    if (ran.current) return;
    if (!state?.serialKey || !state?.username) {
      navigate("/activate", { replace: true });
      return;
    }
    ran.current = true;

    (async () => {
      try {
        if (!window.bukolabs) {
          navigate("/activate", {
            replace: true,
            state: { error: "Run the desktop app with Electron." },
          });
          return;
        }

        const result = await window.bukolabs.auth.activateKey({
          serialKey: state.serialKey,
          username: state.username,
        });

        if (!result.success || !result.token) {
          navigate("/activate", {
            replace: true,
            state: { error: result.error ?? "Activation failed" },
          });
          return;
        }

        saveSession({
          token: result.token,
          userId: result.userId ?? 0,
          role: result.role ?? "user",
          displayName: state.username,
          freshWorkspace: true,
        });
        navigate("/dashboard", { replace: true });
      } catch {
        navigate("/activate", {
          replace: true,
          state: { error: "Activation failed. Check your connection and try again." },
        });
      }
    })();
  }, [navigate, saveSession, state?.serialKey, state?.username]);

  if (!state?.serialKey) return null;

  return <ValidatingSerialKeyScreen />;
}
