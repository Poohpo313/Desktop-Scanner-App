import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { authApi } from "../api/auth.api";
import AdminPinForm from "../components/AdminPinForm";
import SplashScreen from "../components/SplashScreen";
import { useAuth } from "../hooks/useAuth";
import { saveSuperAdminKnownPin } from "../lib/knownPin";
import {
  buildLockoutMessage,
  LOCKOUT_MS,
  MAX_LOGIN_ATTEMPTS,
} from "../lib/loginLockout";
import { isValidSuperAdminPin } from "../lib/pinDigits";
import { useNotificationStore } from "../store/notificationStore";
import "../styles/splash.css";
import "../styles/super-pin.css";

const PIN_LENGTH = 6;
const emptyPin = (): string[] => Array(PIN_LENGTH).fill("");

export default function LoginPage() {
  const location = useLocation();
  const skipSplash = (location.state as { skipSplash?: boolean } | null)?.skipSplash;
  const [phase, setPhase] = useState<"splash" | "pin">(skipSplash ? "pin" : "splash");
  const [pin, setPin] = useState(emptyPin);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    if (skipSplash) {
      navigate(location.pathname, { replace: true, state: null });
      return;
    }
    const t = setTimeout(() => setPhase("pin"), 2200);
    return () => clearTimeout(t);
  }, [location.pathname, navigate, skipSplash]);

  useEffect(() => {
    const resetFromBrowserHistory = (event: PageTransitionEvent) => {
      if (!event.persisted || skipSplash) return;
      window.location.reload();
    };

    window.addEventListener("pageshow", resetFromBrowserHistory);
    return () => window.removeEventListener("pageshow", resetFromBrowserHistory);
  }, [skipSplash]);

  const focusPin = (index: number) => {
    document.getElementById(`pin-${index}`)?.focus();
  };

  const onDigit = (i: number, v: string) => {
    if (isLocked || submittingRef.current) return;
    if (!/^\d?$/.test(v)) return;
    const next = [...pin];
    next[i] = v;
    setPin(next);
    if (v && i < PIN_LENGTH - 1) {
      focusPin(i + 1);
    } else if (!v && i > 0) {
      focusPin(i - 1);
    }
  };

  const onDigitKeyDown = (i: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace" || pin[i]) return;

    if (i > 0) {
      event.preventDefault();
      const next = [...pin];
      next[i - 1] = "";
      setPin(next);
      focusPin(i - 1);
    }
  };

  const attempts = useRef(0);
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const isLocked = lockedUntil != null && lockedUntil > Date.now();

  useEffect(() => {
    if (!lockedUntil || lockedUntil <= Date.now()) return;

    const updateLockMessage = () => {
      const secondsRemaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      if (secondsRemaining <= 0) {
        setLockedUntil(null);
        setError("");
        attempts.current = 0;
        return;
      }
      setError(buildLockoutMessage(secondsRemaining));
    };

    updateLockMessage();
    const intervalId = window.setInterval(updateLockMessage, 1000);
    return () => window.clearInterval(intervalId);
  }, [lockedUntil]);

  const getLoginErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return "Login timed out. Check that the gateway is running on port 3000.";
      }
      if (!error.response) {
        return "Cannot reach the API server. Start the gateway (port 3000) and restart this app.";
      }
      const message = error.response?.data?.message;
      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join(" ");
      if (error.response?.status === 403) {
        return "locked";
      }
      if (error.response?.status === 429) {
        return "Too many login attempts. Wait a moment and try again.";
      }
    }
    return "Invalid PIN.";
  };

  const getServerLockoutUntil = (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 403) return null;
    const lockedUntil = (error.response.data as { lockedUntil?: string })?.lockedUntil;
    if (!lockedUntil) return null;
    const untilMs = Date.parse(lockedUntil);
    return Number.isNaN(untilMs) || untilMs <= Date.now() ? null : untilMs;
  };

  const submitPin = async (value: string) => {
    if (submittingRef.current || isLocked) return;

    if (!isValidSuperAdminPin(value)) {
      setError("Enter all 6 digits of your PIN.");
      focusPin(0);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const res = await authApi.login({ pin: value });
      attempts.current = 0;
      setLockedUntil(null);
      flushSync(() => {
        setSession({ accessToken: res.accessToken, role: "superadmin", userId: res.userId });
      });
      saveSuperAdminKnownPin(value);
      push("Welcome back, Super Admin", "success");
      navigate("/portal/dashboard", { replace: true });
    } catch (error) {
      const message = getLoginErrorMessage(error);
      const serverLockoutUntil = getServerLockoutUntil(error);
      if (message === "locked" || serverLockoutUntil != null) {
        const until = serverLockoutUntil ?? Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setError(
          buildLockoutMessage(Math.max(1, Math.ceil((until - Date.now()) / 1000))),
        );
        setPin(emptyPin());
        return;
      }

      attempts.current += 1;
      if (attempts.current >= MAX_LOGIN_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setError(buildLockoutMessage(Math.ceil(LOCKOUT_MS / 1000)));
      } else {
        setError(
          `${message} ${MAX_LOGIN_ATTEMPTS - attempts.current} attempt${
            MAX_LOGIN_ATTEMPTS - attempts.current === 1 ? "" : "s"
          } left.`,
        );
      }
      setPin(emptyPin());
      if (!isLocked) focusPin(0);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await submitPin(pin.join(""));
  };

  if (phase === "splash") {
    return (
      <SplashScreen
        logoSrc="/assets/Border.svg"
        logoAlt="Bukolabs"
        title="Desktop Scanner"
        subtitle="Secure document scanning made simple."
        status="Preparing your workspace..."
        accessNote="Admin-controlled access - Safe local scanning - Online / offline ready"
      />
    );
  }

  return (
    <AdminPinForm
      logoSrc="/assets/Border.svg"
      logoAlt="Bukolabs"
      title="System Administrator Access"
      subtitle="Enter your administrator PIN to continue"
      error={error}
      pin={pin}
      submitText="Access System"
      recoverTo="/portal/recover-admin"
      recoverText="Forgot PIN?"
      onDigit={onDigit}
      onDigitKeyDown={onDigitKeyDown}
      onSubmit={submit}
      disabled={isLocked}
      submitting={submitting}
    />
  );
}
