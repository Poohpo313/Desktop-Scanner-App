import { useState } from "react";
import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import GenerateKeysSuccessModal from "./GenerateKeysSuccessModal";
import { IconKeyGen } from "../icons/AdminIcons";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import {
  buildLicenseFromGenerateForm,
  deviceLimitPerKey,
  formatExpirationPreview,
  GENERATE_LICENSE_KEYS_INITIAL,
  type ExpirationPeriod,
  type GenerateLicenseKeysFormData,
  type LicenseKeyDisplay,
} from "../../utils/licenseKeyDisplay";
import "../../styles/generate-license-keys-modal.css";

const MAX_KEYS = 100;
const MIN_KEYS = 1;

const LICENSE_TYPES = ["Enterprise", "Standard", "Professional"] as const;

const DEVICE_LIMITS = ["5 Devices", "10 Devices", "25 Devices", "50 Devices", "Unlimited"] as const;

const EXPIRATION_OPTIONS: { value: ExpirationPeriod; label: string }[] = [
  { value: "30-days", label: "30 Days" },
  { value: "1-year", label: "1 Year" },
  { value: "2-years", label: "2 Years" },
  { value: "never", label: "Never" },
];

const SECURITY_OPTIONS: {
  key: keyof Pick<
    GenerateLicenseKeysFormData,
    | "activateImmediately"
    | "requireFirstUseVerification"
    | "notifyAssignedOrganization"
    | "restrictToApprovedDevices"
  >;
  label: string;
}[] = [
  { key: "activateImmediately", label: "Activate Immediately" },
  { key: "requireFirstUseVerification", label: "Require First-Use Verification" },
  { key: "notifyAssignedOrganization", label: "Notify Assigned Organization" },
  { key: "restrictToApprovedDevices", label: "Restrict to Approved Devices Only" },
];

type Props = {
  closeTo?: string;
  confirmTo?: string;
  onClose?: () => void;
  onConfirm?: (license: LicenseKeyDisplay) => void | Promise<void>;
  saving?: boolean;
};

function IconBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="2.5" width="10" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 5H7M6 7.5H7M6 10H7M9 5H10M9 7.5H10M9 10H10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function IconPreviewCube() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2.5L15.25 6.25V11.75L9 15.5L2.75 11.75V6.25L9 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9 9L15.25 6.25M9 9V15.5M9 9L2.75 6.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function clampKeyCount(value: number) {
  return Math.min(MAX_KEYS, Math.max(MIN_KEYS, value));
}

function GenerateLicenseKeysFormModal({
  closeTo,
  onClose,
  onGenerate,
}: {
  closeTo?: string;
  onClose?: () => void;
  onGenerate: (data: GenerateLicenseKeysFormData) => void;
}) {
  const [formData, setFormData] = useState<GenerateLicenseKeysFormData>(GENERATE_LICENSE_KEYS_INITIAL);

  const updateField = <K extends keyof GenerateLicenseKeysFormData>(key: K, value: GenerateLicenseKeysFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const adjustKeyCount = (delta: number) => {
    setFormData((prev) => ({ ...prev, keyCount: clampKeyCount(prev.keyCount + delta) }));
  };

  const footer = (
    <>
      {onClose ? (
        <button type="button" className="gen-keys-form__cancel-btn" onClick={onClose}>
          Cancel
        </button>
      ) : (
        <Link to={closeTo!} className="gen-keys-form__cancel-btn">
          Cancel
        </Link>
      )}
      <button type="button" className="figma-btn figma-btn--primary gen-keys-form__submit-btn" onClick={() => onGenerate(formData)}>
        <IconKeyGen className="gen-keys-form__submit-icon" aria-hidden="true" />
        Generate Keys
      </button>
    </>
  );

  return (
    <FigmaModal
      className="figma-modal--generate-keys-form"
      title="Generate Serial Keys"
      subtitle="Configure and issue new enterprise scanner serials."
      wide
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={footer}
      footerClassName="gen-keys-form__footer"
    >
      <div className="gen-keys-form__layout">
        <div className="gen-keys-form__main">
          <div className="gen-keys-form__field">
            <label className="gen-keys-form__label" htmlFor="gen-keys-license-type">
              Serial Type
            </label>
            <div className="gen-keys-form__select-wrap">
              <select
                id="gen-keys-license-type"
                className="gen-keys-form__select"
                value={formData.licenseType}
                onChange={(event) => updateField("licenseType", event.target.value)}
              >
                {LICENSE_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="gen-keys-form__field">
            <label className="gen-keys-form__label" htmlFor="gen-keys-count">
              Number of Keys
            </label>
            <div className="gen-keys-form__stepper">
              <button type="button" className="gen-keys-form__stepper-btn" onClick={() => adjustKeyCount(-1)} aria-label="Decrease number of keys">
                −
              </button>
              <input
                id="gen-keys-count"
                className="gen-keys-form__stepper-input"
                type="number"
                min={MIN_KEYS}
                max={MAX_KEYS}
                value={formData.keyCount}
                onChange={(event) => updateField("keyCount", clampKeyCount(Number(event.target.value) || MIN_KEYS))}
              />
              <button type="button" className="gen-keys-form__stepper-btn" onClick={() => adjustKeyCount(1)} aria-label="Increase number of keys">
                +
              </button>
            </div>
            <p className="gen-keys-form__hint">Max limit: 100 keys per batch.</p>
          </div>

          <div className="gen-keys-form__field">
            <p className="gen-keys-form__label">Expiration Period</p>
            <div className="gen-keys-form__expiry-grid">
              {EXPIRATION_OPTIONS.map((option) => {
                const selected = formData.expirationPeriod === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`gen-keys-form__expiry-btn${selected ? " gen-keys-form__expiry-btn--selected" : ""}`}
                    onClick={() => updateField("expirationPeriod", option.value)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="gen-keys-form__field">
            <label className="gen-keys-form__label" htmlFor="gen-keys-assign-to">
              Assign To
            </label>
            <div className="gen-keys-form__input-wrap">
              <span className="gen-keys-form__input-icon" aria-hidden="true">
                <IconBuilding />
              </span>
              <input
                id="gen-keys-assign-to"
                className="gen-keys-form__input"
                value={formData.assignTo}
                onChange={(event) => updateField("assignTo", event.target.value)}
              />
            </div>
          </div>

          <div className="gen-keys-form__field">
            <label className="gen-keys-form__label" htmlFor="gen-keys-device-limit">
              Device Limit
            </label>
            <div className="gen-keys-form__select-wrap">
              <select
                id="gen-keys-device-limit"
                className="gen-keys-form__select"
                value={formData.deviceLimit}
                onChange={(event) => updateField("deviceLimit", event.target.value)}
              >
                {DEVICE_LIMITS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <aside className="gen-keys-form__aside">
          <div className="gen-keys-form__preview">
            <div className="gen-keys-form__preview-head">
              <span className="gen-keys-form__preview-badge">Preview</span>
              <span className="gen-keys-form__preview-cube" aria-hidden="true">
                <IconPreviewCube />
              </span>
            </div>
            <p className="gen-keys-form__preview-eyebrow">Generated Pattern</p>
            <p className="gen-keys-form__preview-code">BUKO-XXXX-XXXX</p>
            <dl className="gen-keys-form__preview-grid">
              <div>
                <dt>Type</dt>
                <dd>{formData.licenseType}</dd>
              </div>
              <div>
                <dt>Batch Size</dt>
                <dd>{formData.keyCount} Keys</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>{formatExpirationPreview(formData.expirationPeriod)}</dd>
              </div>
              <div>
                <dt>Device Limit</dt>
                <dd>{deviceLimitPerKey(formData.deviceLimit)}</dd>
              </div>
            </dl>
          </div>

          <div className="gen-keys-form__field">
            <p className="gen-keys-form__label">Security Options</p>
            <div className="gen-keys-form__checks">
              {SECURITY_OPTIONS.map((option) => (
                <label key={option.key} className="gen-keys-form__check">
                  <input
                    type="checkbox"
                    checked={formData[option.key]}
                    onChange={(event) => updateField(option.key, event.target.checked)}
                  />
                  <span className="gen-keys-form__check-box" aria-hidden="true" />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="gen-keys-form__field">
            <label className="gen-keys-form__label" htmlFor="gen-keys-notes">
              Internal Notes
            </label>
            <textarea
              id="gen-keys-notes"
              className="gen-keys-form__textarea"
              placeholder="Add details about this key batch..."
              value={formData.internalNotes}
              onChange={(event) => updateField("internalNotes", event.target.value)}
              rows={4}
            />
          </div>
        </aside>
      </div>
    </FigmaModal>
  );
}

export default function GenerateLicenseKeysModal({
  closeTo,
  confirmTo,
  onClose,
  onConfirm,
  saving = false,
}: Props) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [license, setLicense] = useState<LicenseKeyDisplay | null>(null);

  const handleGenerate = (data: GenerateLicenseKeysFormData) => {
    setLicense(buildLicenseFromGenerateForm(data));
    setStep("success");
  };

  const handleSuccessConfirm = async () => {
    if (!license) return;

    if (onConfirm) {
      await onConfirm(license);
      return;
    }

    onClose?.();
  };

  if (step === "success" && license) {
    return (
      <GenerateKeysSuccessModal
        license={license}
        saving={saving}
        onClose={onClose}
        onConfirm={() => void handleSuccessConfirm()}
        closeTo={closeTo}
        confirmTo={confirmTo}
      />
    );
  }

  return <GenerateLicenseKeysFormModal closeTo={closeTo} onClose={onClose} onGenerate={handleGenerate} />;
}
