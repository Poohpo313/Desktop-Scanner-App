import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { authApi } from "../api/auth.api";
import AdminPinForm from "../components/AdminPinForm";
import SplashScreen from "../components/SplashScreen";
import { useAuth } from "../hooks/useAuth";
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
  const lockedUntil = useRef(0);

  const getLoginErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return "Cannot reach the API server. Start the gateway (port 3000) and restart this app.";
      }
      const message = error.response?.data?.message;
      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join(" ");
      if (error.response?.status === 403) {
        return "Account locked due to failed login attempts. Try again in 15 minutes.";
      }
    }
    return "Invalid PIN.";
  };

  const submitPin = async (value: string) => {
    setError("");
    if (lockedUntil.current > Date.now()) {
      setError("Locked after 5 failed attempts. Try again in 15 minutes.");
      return;
    }
    try {
      const res = await authApi.login({ pin: value });
      attempts.current = 0;
      lockedUntil.current = 0;
      setSession({ accessToken: res.accessToken, role: "superadmin", userId: res.userId });
      push("Welcome back, Super Admin", "success");
      navigate("/portal/dashboard", { replace: true });
    } catch (error) {
      const message = getLoginErrorMessage(error);
      if (message.toLowerCase().includes("locked")) {
        lockedUntil.current = Date.now() + 15 * 60 * 1000;
        setError(message);
        return;
      }

      attempts.current += 1;
      if (attempts.current >= 5) {
        lockedUntil.current = Date.now() + 15 * 60 * 1000;
        setError("Locked after 5 failed attempts.");
      } else {
        setError(`${message} ${5 - attempts.current} attempts left.`);
      }
      setPin(emptyPin());
      focusPin(0);
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
      title="Administrator Access"
      subtitle="Enter your administrator PIN to continue"
      label="Admin PIN"
      error={error}
      pin={pin}
      submitText="Access System"
      recoverTo="/portal/recover-admin"
      recoverText="Forgot PIN?"
      onDigit={onDigit}
      onDigitKeyDown={onDigitKeyDown}
      onSubmit={submit}
    />
  );
}
