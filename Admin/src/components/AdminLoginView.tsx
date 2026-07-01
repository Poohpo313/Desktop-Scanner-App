import { FormEvent, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";
import { useNotificationStore } from "../store/notificationStore";
import { PORTAL } from "../routes/portalPaths";
import BrandHeroHeader from "./BrandHeroHeader";
import {
  IconLoginArrow,
  IconLoginCheck,
  IconLoginEye,
  IconLoginLock,
  IconLoginUser,
  IconOfficerAccessUser,
  IconOfficerFieldLock,
  IconOfficerFieldUser,
} from "./icons/LoginIcons";
import "../styles/auth-shell.css";
import "../styles/login.css";
import "../styles/admin-officer-login.css";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const SECURITY_FEATURES = [
  "Secure Authentication",
  "Role-Based Access Control",
  "Cloud Synchronization",
];

type Props = {
  variant?: "portal" | "figma";
  onSuccessNavigate?: string;
};

export default function AdminLoginView({
  variant = "portal",
  onSuccessNavigate = "/portal/dashboard",
}: Props) {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const push = useNotificationStore((s) => s.push);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const attempts = useRef(0);
  const lockedUntil = useRef(0);
  const recoverHref = variant === "figma" ? "/admin-recover-access" : PORTAL.recoverAccess;

  useEffect(() => {
    document.body.classList.add(variant === "figma" ? "admin-officer-login-page" : "admin-login-page");
    return () => {
      document.body.classList.remove(
        variant === "figma" ? "admin-officer-login-page" : "admin-login-page",
      );
    };
  }, [variant]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (lockedUntil.current > Date.now()) {
      setError("Account locked after 5 failed attempts. Try again later.");
      return;
    }

    if (variant === "figma") {
      navigate(onSuccessNavigate);
      return;
    }

    try {
      const res = await authApi.login({ username, password });
      attempts.current = 0;
      flushSync(() => {
        setSession({ accessToken: res.accessToken, role: "admin", userId: res.userId });
      });
      push("Login successful", "success");
      navigate(onSuccessNavigate, { replace: true });
    } catch {
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        lockedUntil.current = Date.now() + LOCKOUT_MS;
        setError("Account locked after 5 failed attempts. Try again in 15 minutes.");
      } else {
        setError(`Invalid credentials. ${MAX_ATTEMPTS - attempts.current} attempts remaining.`);
      }
    }
  };

  if (variant === "figma") {
    return (
      <div className="admin-officer-login">
        <div className="admin-officer-login__card">
          <header className="admin-officer-login__header">
            <div className="admin-officer-login__badge">
              <IconOfficerAccessUser className="admin-officer-login__badge-icon" />
            </div>
            <div className="admin-officer-login__heading">
              <h1 className="admin-officer-login__title">Administrator Officer Access</h1>
              <p className="admin-officer-login__subtitle">Sign in to your assigned account.</p>
            </div>
          </header>

          <form className="admin-officer-login__form" onSubmit={onSubmit}>
            {error && <p className="admin-officer-login__error">{error}</p>}

            <div className="admin-officer-login__field">
              <label className="admin-officer-login__label" htmlFor="admin-username">
                Username
              </label>
              <div className="admin-officer-login__input-wrap">
                <IconOfficerFieldUser className="admin-officer-login__input-icon" aria-hidden="true" />
                <input
                  id="admin-username"
                  className="admin-officer-login__input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="admin-officer-login__field">
              <div className="admin-officer-login__label-row">
                <label className="admin-officer-login__label" htmlFor="admin-password">
                  Password
                </label>
                <Link className="admin-officer-login__access-link" to={recoverHref}>
                  Can&apos;t Access?
                </Link>
              </div>
              <div className="admin-officer-login__input-wrap">
                <IconOfficerFieldLock
                  className="admin-officer-login__input-icon admin-officer-login__input-icon--lock"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  className="admin-officer-login__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-officer-login__eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <IconLoginEye className="admin-officer-login__eye-icon" aria-hidden="true" />
                </button>
              </div>
            </div>

            <label className="admin-officer-login__remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me on this device</span>
            </label>

            <button className="admin-officer-login__submit" type="submit">
              <IconLoginArrow className="admin-officer-login__submit-icon" aria-hidden="true" />
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-split admin-login">
      <aside className="auth-hero admin-login__hero">
        <div className="auth-hero__inner admin-login__hero-inner">
          <BrandHeroHeader />

          <div className="auth-hero__copy admin-login__hero-copy">
            <h1 className="auth-hero__headline auth-hero__headline--stacked admin-login__headline">
              <span className="auth-hero__headline-line admin-login__headline-line">Admin Control</span>
              <span className="auth-hero__headline-line admin-login__headline-line">Panel</span>
            </h1>
            <p className="auth-hero__description admin-login__description">
              Manage users, serial keys, devices and cloud services from a single dashboard.
            </p>
          </div>

          <div className="auth-hero__glass-panel admin-login__security">
            <h2 className="auth-hero__glass-panel-title admin-login__security-title">Security Features</h2>
            <ul className="auth-hero__glass-list admin-login__security-list">
              {SECURITY_FEATURES.map((feature) => (
                <li key={feature}>
                  <IconLoginCheck className="auth-hero__glass-check admin-login__security-check" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <section className="auth-panel admin-login__panel">
        <div className="admin-login__panel-inner">
          <form className="admin-login__card" onSubmit={onSubmit}>
            <header className="admin-login__card-header">
              <h2 className="admin-login__card-title">Admin Login</h2>
              <p className="admin-login__card-subtitle">
                Welcome back. Enter your credentials to continue.
              </p>
            </header>

            {error && <p className="admin-login__error">{error}</p>}

            <div className="admin-login__field">
              <label className="admin-login__label" htmlFor="admin-username">
                Username
              </label>
              <div className="admin-login__input-wrap">
                <IconLoginUser className="admin-login__input-icon" aria-hidden="true" />
                <input
                  id="admin-username"
                  className="admin-login__input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="admin-login__field">
              <label className="admin-login__label" htmlFor="admin-password">
                Password
              </label>
              <div className="admin-login__input-wrap">
                <IconLoginLock
                  className="admin-login__input-icon admin-login__input-icon--lock"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  className="admin-login__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-login__eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <IconLoginEye className="admin-login__eye-icon" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="admin-login__options">
              <label className="admin-login__remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>
              <Link className="admin-login__forgot-link" to={recoverHref}>
                Can&apos;t Access?
              </Link>
            </div>

            <button className="admin-login__submit" type="submit">
              <IconLoginArrow className="admin-login__submit-icon" aria-hidden="true" />
              Login
            </button>
          </form>

          <footer className="admin-login__legal">
            <p>© 2026 Desktop Scanner Administration System. All rights reserved.</p>
            <div className="admin-login__legal-links">
              <a href="#privacy">Privacy Policy</a>
              <span aria-hidden="true">·</span>
              <a href="#terms">Terms of Service</a>
              <span aria-hidden="true">·</span>
              <a href="#accessibility">Accessibility Statement</a>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
