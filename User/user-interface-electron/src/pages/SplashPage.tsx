import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BukolabsBrand } from "../components/brand/BukolabsBrand";
import { useSession } from "../context/SessionContext";
import "../styles/splash.css";

const MESSAGES = [
  "Preparing your workspace...",
  "Checking local services...",
  "Loading scanner modules...",
];

export default function SplashPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [status, setStatus] = useState(MESSAGES[0]);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setStatus((prev) => {
        const i = MESSAGES.indexOf(prev);
        return MESSAGES[(i + 1) % MESSAGES.length];
      });
    }, 900);

    const navTimer = setTimeout(async () => {
      if (session.token && window.bukolabs) {
        const result = await window.bukolabs.auth.checkSession({ token: session.token });
        if (result?.valid) {
          navigate("/checking-connection", { replace: true });
          return;
        }
      }

      navigate("/welcome", { replace: true });
    }, 2800);

    return () => {
      clearInterval(msgTimer);
      clearTimeout(navTimer);
    };
  }, [navigate, session.token]);

  return (
    <main className="splash">
      <div className="splash__shape splash__shape--left" aria-hidden="true" />
      <div className="splash__shape splash__shape--right" aria-hidden="true" />

      <section className="splash__panel">
        <BukolabsBrand variant="splash" />

        <h1 className="splash__title">Desktop Scanner</h1>
        <p className="splash__subtitle">Secure document scanning made simple.</p>

        <div className="splash__progress" aria-hidden="true">
          <div className="splash__progress-fill" />
        </div>
        <p className="splash__status">{status}</p>
      </section>

      <footer className="splash__footer">
        <span className="splash__footer-item">Admin-controlled access</span>
        <span className="splash__footer-dot">•</span>
        <span className="splash__footer-item">Safe local scanning</span>
        <span className="splash__footer-dot">•</span>
        <span className="splash__footer-item">Online/Offline ready</span>
      </footer>
    </main>
  );
}
