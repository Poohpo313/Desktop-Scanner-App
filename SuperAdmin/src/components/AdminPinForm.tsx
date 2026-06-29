import type { FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import SecurityAssurances from "./SecurityAssurances";

type Props = {
  logoSrc: string;
  logoAlt: string;
  title: string;
  subtitle: string;
  label: string;
  error: string;
  pin: string[];
  submitText: string;
  recoverTo: string;
  recoverText: string;
  onDigit: (index: number, value: string) => void;
  onDigitKeyDown?: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent) => void;
};

export default function AdminPinForm({
  logoSrc,
  logoAlt,
  title,
  subtitle,
  label,
  error,
  pin,
  submitText,
  recoverTo,
  recoverText,
  onDigit,
  onDigitKeyDown,
  onSubmit,
}: Props) {
  return (
    <div className="super-pin">
      <form className="super-pin__card" onSubmit={onSubmit}>
        <div className="super-pin__header">
          <div className="super-pin__icon-frame">
            <img src={logoSrc} alt={logoAlt} />
          </div>
          <div className="super-pin__title">{title}</div>
          <p className="super-pin__subtitle">{subtitle}</p>
        </div>

        <div className="super-pin__body">
          <div className="super-pin__pin-header">
            <label className="super-pin__label" htmlFor="pin-0">
              {label}
            </label>
            {error && <p className="super-pin__error">{error}</p>}
          </div>
          <div className="super-pin__digits">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                className="super-pin__digit"
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => onDigit(index, e.target.value)}
                onKeyDown={(e) => onDigitKeyDown?.(index, e)}
                autoFocus={index === 0}
              />
            ))}
          </div>
          <button className="super-pin__submit" type="submit">
            {submitText}
          </button>
          <Link className="super-pin__recover" to={recoverTo}>
            {recoverText}
          </Link>
        </div>

        <SecurityAssurances className="super-pin__footer" />
      </form>
    </div>
  );
}
