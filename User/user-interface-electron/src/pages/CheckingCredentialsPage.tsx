import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckingCredentialsScreen } from "../components/auth/CheckingCredentialsScreen";
import { useSession } from "../context/SessionContext";

type LoginState = {
  username: string;
  password: string;
  attempts?: number;
};

export default function CheckingCredentialsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveSession } = useSession();
  const ran = useRef(false);
  const state = location.state as LoginState | null;

  useEffect(() => {
    if (ran.current) return;
    if (!state?.username || !state?.password) {
      navigate("/login", { replace: true });
      return;
    }
    ran.current = true;

    (async () => {
      if (!window.bukolabs) {
        navigate("/login", {
          replace: true,
          state: { error: "Run the desktop app with Electron." },
        });
        return;
      }

      const result = await window.bukolabs.auth.login({
        username: state.username,
        password: state.password,
      });

      if (!result.success || !result.token || result.userId == null) {
        const attempts = (state.attempts ?? 0) + 1;
        const activationError = "Account not Activated : Activate account first to access";
        const errorMessage =
          result.error === activationError
            ? activationError
            : result.error && result.error !== "Invalid credentials"
              ? result.error
              : `Invalid username or password. ${Math.max(0, 5 - attempts)} attempts remaining.`;

        navigate("/login", {
          replace: true,
          state: {
            error: errorMessage,
            attempts,
          },
        });
        return;
      }

      saveSession({
        token: result.token,
        userId: result.userId,
        role: result.role ?? "user",
        displayName: state.username,
        freshWorkspace: false,
      });
      navigate("/checking-connection", { replace: true });
    })();
  }, [navigate, saveSession, state]);

  if (!state?.username) return null;

  return <CheckingCredentialsScreen />;
}
