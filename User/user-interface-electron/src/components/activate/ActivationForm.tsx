import { FormEvent } from "react";
import { Link } from "react-router-dom";
import { FigmaIcon } from "../FigmaIcon";

type Props = {
  username: string;
  serialKey: string;
  error: string;
  onUsernameChange: (value: string) => void;
  onSerialKeyChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function ActivationForm({
  username,
  serialKey,
  error,
  onUsernameChange,
  onSerialKeyChange,
  onSubmit,
}: Props) {
  const accessQuery = new URLSearchParams();
  if (username.trim()) accessQuery.set("username", username.trim());
  if (serialKey.trim()) accessQuery.set("serialKey", serialKey.trim());
  const accessSuffix = accessQuery.toString() ? `?${accessQuery.toString()}` : "";

  const requestQuery = new URLSearchParams({ context: "activation" });
  if (username.trim()) requestQuery.set("username", username.trim());
  if (serialKey.trim()) requestQuery.set("serialKey", serialKey.trim());
  const requestSuffix = `?${requestQuery.toString()}`;

  return (
    <div className="activation-form">
      <Link to="/welcome" className="activation-form__back">
        ← Back to Welcome
      </Link>

      <h1 className="activation-form__title">Activate Account</h1>
      <p className="activation-form__subtitle">
        Enter your assigned username and serial key provided by the administrator.
      </p>

      <form onSubmit={onSubmit} className="activation-form__fields">
        {error && <p className="activation-form__error">{error}</p>}

        <div className="activation-form__field">
          <label className="activation-form__label" htmlFor="activate-username">
            Username
          </label>
          <div className="activation-form__input-wrap">
            <FigmaIcon name="user" className="activation-form__input-icon" />
            <input
              className="activation-form__input"
              id="activate-username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="activation-form__field">
          <label className="activation-form__label" htmlFor="activate-serial-key">
            Serial Key
          </label>
          <div className="activation-form__input-wrap">
            <FigmaIcon name="lock" className="activation-form__input-icon" />
            <input
              className="activation-form__input activation-form__input--mono"
              id="activate-serial-key"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={serialKey}
              onChange={(e) => onSerialKeyChange(e.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              required
            />
          </div>
        </div>

        <div className="activation-form__actions">
          <Link to={`/need-account-access${accessSuffix}`} className="activation-form__help-link">
            <FigmaIcon name="help" className="activation-form__help-icon" />
            Need account access?
          </Link>
          <button type="submit" className="activation-form__submit">
            <FigmaIcon name="shield" className="activation-form__submit-icon" />
            Activate Account
          </button>
        </div>
      </form>

      <div className="activation-form__info">
        <div className="activation-form__info-icon" aria-hidden="true">
          <FigmaIcon name="helpLarge" className="w-5 h-5" />
        </div>
        <div>
          <h3 className="activation-form__info-title">Don&apos;t have an account yet?</h3>
          <p className="activation-form__info-desc">
            Please contact your administrator to obtain your assigned username and serial key.
            After activation, sign in with the default password provided by your administrator.
          </p>
          <div className="activation-form__request-links">
            <Link
              to={`/request-email${requestSuffix}`}
              className="activation-form__request-link"
            >
              Request Through Email
            </Link>
            <Link to={`/request-sms${requestSuffix}`} className="activation-form__request-link">
              Request Through SMS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
