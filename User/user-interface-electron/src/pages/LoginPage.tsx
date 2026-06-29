import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthInfoPanel } from "../components/auth/AuthInfoPanel";
import { AuthPageShell } from "../components/auth/AuthPageShell";
import { FigmaIcon } from "../components/FigmaIcon";
import { icons } from "../icons";

const LOGIN_BENEFITS = [
  {
    icon: "shield" as const,
    title: "Secure Access",
    text: "Only authorized users can access your assigned account.",
  },
  {
    icon: "lock" as const,
    title: "Local & Safe",
    text: "Your documents stay on your device and remain under your control.",
  },
  {
    icon: "wifi" as const,
    title: "Online / Offline Ready",
    text: "Work seamlessly whether you're online or offline.",
  },
];

type LoginLocationState = {
  error?: string;
  attempts?: number;
  activated?: boolean;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as LoginLocationState | null) ?? {};
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      setError("Run the desktop app with Electron (npm run dev in user-interface-electron).");
      return;
    }

    navigate("/checking", {
      state: {
        username,
        password,
        attempts: routeState.attempts ?? 0,
      },
    });
  }

  return (
    <AuthPageShell screenSlug="section-1-1-returning-user-login">
      <AuthInfoPanel benefits={LOGIN_BENEFITS} />

      <div className="auth-page__form-area">
        <div className="login-card">
          <header className="login-card__header">
            <div className="login-card__icon">
              <img src={icons.userLarge} alt="" />
            </div>
            <div>
              <h2 className="login-card__title">Returning User</h2>
              <p className="login-card__subtitle">Sign in to your assigned account.</p>
            </div>
          </header>

          <form onSubmit={onSubmit}>
            {routeState.activated && (
              <p className="login__alert">
                Account activated — sign in with your assigned password.
              </p>
            )}
            {error && <p className="login__error">{error}</p>}

            <div className="login__form-grid">
              <div className="login__field-group">
                <label className="login__label" htmlFor="username">
                  Username
                </label>
                <div className="login__input-wrap">
                  <FigmaIcon name="user" className="w-4 h-4 opacity-50" />
                  <input
                    className="login__input"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="login__field-group">
                <div className="login__field-row">
                  <label className="login__label" htmlFor="password">
                    Password
                  </label>
                  <Link
                    to={
                      username.trim()
                        ? `/forgot?username=${encodeURIComponent(username.trim())}`
                        : "/forgot"
                    }
                    className="login__link"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="login__input-wrap">
                  <FigmaIcon name="lock" className="w-4 h-4 opacity-50" />
                  <input
                    className="login__input"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login__link border-0 bg-transparent p-0"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <FigmaIcon name="eye" className="w-4 h-4 opacity-50" />
                  </button>
                </div>
              </div>

              <label className="login__checkbox-row">
                <input
                  type="checkbox"
                  className="login__checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="login__checkbox-label">Remember me on this device</span>
              </label>
            </div>

            <button className="login__button" type="submit">
              <span aria-hidden>→</span> Sign In
            </button>
          </form>

          <p className="login-card__footer-links">
            <Link to="/welcome">← Back to welcome</Link>
            {" · "}
            New user? <Link to="/activate">Activate account</Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
}
