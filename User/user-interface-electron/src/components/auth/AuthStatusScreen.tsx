import { Link } from "react-router-dom";
import { FigmaIcon } from "../FigmaIcon";
import { IconCheck, IconSpinner } from "../icons";

type Props = {
  variant: "loading" | "success" | "warning";
  title: string;
  message: string;
  primaryAction?: { label: string; to: string };
  secondaryAction?: { label: string; to: string };
};

export function AuthStatusScreen({
  variant,
  title,
  message,
  primaryAction,
  secondaryAction,
}: Props) {
  return (
    <div className="auth-shell">
      <div className="auth-card text-center space-y-5">
        {variant === "loading" && <IconSpinner className="w-12 h-12 mx-auto" />}
        {variant === "success" && (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-mint">
            <IconCheck className="w-7 h-7" />
          </div>
        )}
        {variant === "warning" && (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <FigmaIcon name="warning" className="w-8 h-8" />
          </div>
        )}

        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {secondaryAction && (
            <Link to={secondaryAction.to} className="btn-outline text-sm py-2.5">
              {secondaryAction.label}
            </Link>
          )}
          {primaryAction && (
            <Link to={primaryAction.to} className="btn-primary text-sm py-2.5">
              {primaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
