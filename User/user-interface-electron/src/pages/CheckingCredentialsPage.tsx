import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckingCredentialsScreen } from "../components/auth/CheckingCredentialsScreen";
import { useSession } from "../context/SessionContext";

type LoginState = {
  username: string;
  password: string;
};

const ACTIVATION_ERROR = "Account not Activated : Activate account first to access";

function formatAttemptsMessage(attemptsRemaining: number) {
  return `Invalid username or password. ${attemptsRemaining} attempt${
    attemptsRemaining === 1 ? "" : "s"
  } remaining.`;
}

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
        const errorMessage =
          result.error === ACTIVATION_ERROR
            ? ACTIVATION_ERROR
            : result.error ??
              (result.attemptsRemaining != null
                ? formatAttemptsMessage(result.attemptsRemaining)
                : "Invalid username or password.");

        navigate("/login", {
          replace: true,
          state: {
            error: errorMessage,
            attemptsRemaining: result.attemptsRemaining,
            lockedUntil: result.lockedUntil,
            username: state.username,
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
