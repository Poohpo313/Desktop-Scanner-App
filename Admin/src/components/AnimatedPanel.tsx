import { useEffect, useState, type ReactNode } from "react";
import "../styles/page-transition.css";

type Props = {
  transitionKey: string | number;
  className?: string;
  children: ReactNode;
};

export default function AnimatedPanel({ transitionKey, className, children }: Props) {
  const [phase, setPhase] = useState<"enter" | "idle">("enter");

  useEffect(() => {
    setPhase("enter");
    const timer = window.setTimeout(() => setPhase("idle"), 220);
    return () => window.clearTimeout(timer);
  }, [transitionKey]);

  return (
    <div
      className={`page-transition${phase === "enter" ? " page-transition--enter" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
