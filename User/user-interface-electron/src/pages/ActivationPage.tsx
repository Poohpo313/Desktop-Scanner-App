import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ActivateInfoPanel } from "../components/activate/ActivateInfoPanel";
import { ActivationForm } from "../components/activate/ActivationForm";
import { ActivateStatusBar } from "../components/activate/ActivateStatusBar";
import { AuthPageShell } from "../components/auth/AuthPageShell";
import "../styles/activate.css";

type ActivationLocationState = { error?: string };

const SERIAL_KEY_PATTERN =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

export default function ActivationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as ActivationLocationState | null) ?? {};
  const [serialKey, setSerialKey] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(routeState.error ?? "");

  useEffect(() => {
    if (routeState.error) {
      setError(routeState.error);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [routeState.error, navigate, location.pathname]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!window.bukolabs) {
      setError("Run the desktop app with Electron.");
      return;
    }

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!serialKey.trim()) {
      setError("Serial key is required.");
      return;
    }

    if (!SERIAL_KEY_PATTERN.test(serialKey.trim())) {
      setError("Invalid serial key format.");
      return;
    }

    navigate("/validating-key", {
      state: { serialKey: serialKey.trim(), username: username.trim() },
    });
  }

  return (
    <AuthPageShell
      screenSlug="section-1-2-activate-account"
      className="activate-page"
      statusBar={<ActivateStatusBar />}
    >
      <ActivateInfoPanel />

      <div className="auth-page__form-area">
        <ActivationForm
          username={username}
          serialKey={serialKey}
          error={error}
          onUsernameChange={setUsername}
          onSerialKeyChange={setSerialKey}
          onSubmit={onSubmit}
        />
      </div>
    </AuthPageShell>
  );
}
