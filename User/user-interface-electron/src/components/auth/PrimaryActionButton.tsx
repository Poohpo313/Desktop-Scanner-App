import { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
};

export function PrimaryActionButton({ to, children, icon }: Props) {
  return (
    <Link to={to} className="auth-primary-btn">
      {icon ? <span className="auth-primary-btn__icon">{icon}</span> : null}
      {children}
    </Link>
  );
}
