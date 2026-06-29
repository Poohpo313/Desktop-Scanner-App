import { Check, Layers2, Network, Printer, Scan, Wifi, X, Zap } from "lucide-react";
import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import type { AddDevicePayload, ConnectionType, DeviceKind } from "./devicesData";
import "../../styles/add-device-modal.css";

type AddDeviceModalProps = {
  onCancel: () => void;
  onAdd: (payload: AddDevicePayload) => void;
};

type AddDeviceStep = "type" | "details";

const DEVICE_TYPE_OPTIONS: Array<{
  id: DeviceKind;
  title: string;
  description: string;
  icon: typeof Scan;
}> = [
  {
    id: "scanner",
    title: "Scanner",
    description: "For devices used mainly for scanning documents.",
    icon: Scan,
  },
  {
    id: "printer",
    title: "Printer",
    description: "For devices used mainly for printing documents.",
    icon: Printer,
  },
  {
    id: "multifunction",
    title: "All-in-One / Multifunction Device",
    description: "For devices that support both scanning and printing.",
    icon: Layers2,
  },
];

const CONNECTION_OPTIONS: Array<{
  id: ConnectionType;
  label: string;
  icon: typeof Zap;
}> = [
  { id: "usb", label: "USB", icon: Zap },
  { id: "network", label: "Network", icon: Network },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
];

export function AddDeviceModal({ onCancel, onAdd }: AddDeviceModalProps) {
  const [step, setStep] = useState<AddDeviceStep>("type");
  const [deviceType, setDeviceType] = useState<DeviceKind | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [connectionType, setConnectionType] = useState<ConnectionType>("usb");

  const canContinue = deviceType !== null;
  const canAdd = deviceType !== null && deviceName.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canAdd || !deviceType) return;

    onAdd({
      kind: deviceType,
      name: deviceName.trim(),
      connectionType,
    });
  }

  return createPortal(
    <div className="add-device-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="add-device-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-device-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="add-device-modal__header">
          <div>
            <h2 id="add-device-modal-title" className="add-device-modal__title">
              {step === "type" ? "Add Device" : "Add Device"}
            </h2>
            {step === "type" ? (
              <p className="add-device-modal__subtitle">Choose the hardware category you want to add.</p>
            ) : null}
          </div>
          <button
            type="button"
            className="add-device-modal__close"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        {step === "type" ? (
          <>
            <div className="add-device-modal__body add-device-modal__body--type">
              <div className="add-device-modal__type-panel">
                <h3 className="add-device-modal__type-title">Select Device Type</h3>
                <p className="add-device-modal__type-subtitle">
                  Choose the hardware category you want to add.
                </p>
                <div className="add-device-modal__type-list" role="listbox" aria-label="Device type">
                  {DEVICE_TYPE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = deviceType === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`add-device-modal__type-option${active ? " add-device-modal__type-option--active" : ""}`}
                        onClick={() => setDeviceType(option.id)}
                      >
                        <span className="add-device-modal__type-icon-wrap">
                          <Icon className="add-device-modal__type-icon" strokeWidth={1.8} />
                        </span>
                        <span className="add-device-modal__type-copy">
                          <span className="add-device-modal__type-name">{option.title}</span>
                          <span className="add-device-modal__type-desc">{option.description}</span>
                        </span>
                        {active ? (
                          <Check className="add-device-modal__type-check" strokeWidth={2.2} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className="add-device-modal__footer">
              <button type="button" className="add-device-modal__btn add-device-modal__btn--cancel" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="add-device-modal__btn add-device-modal__btn--add"
                disabled={!canContinue}
                onClick={() => setStep("details")}
              >
                Continue
              </button>
            </footer>
          </>
        ) : (
          <form className="add-device-modal__form" onSubmit={handleSubmit}>
            <div className="add-device-modal__body">
              <label className="add-device-modal__field">
                <span className="add-device-modal__label">Device Name</span>
                <input
                  type="text"
                  className="add-device-modal__input"
                  placeholder="Enter device name"
                  value={deviceName}
                  onChange={(event) => setDeviceName(event.target.value)}
                  autoFocus
                />
              </label>

              <fieldset className="add-device-modal__field add-device-modal__field--connections">
                <legend className="add-device-modal__label">Connection Type</legend>
                <div className="add-device-modal__connections">
                  {CONNECTION_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = connectionType === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`add-device-modal__connection${active ? " add-device-modal__connection--active" : ""}`}
                        onClick={() => setConnectionType(option.id)}
                      >
                        <Icon className="add-device-modal__connection-icon" strokeWidth={1.8} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <footer className="add-device-modal__footer">
              <button
                type="button"
                className="add-device-modal__btn add-device-modal__btn--cancel"
                onClick={() => setStep("type")}
              >
                Back
              </button>
              <button type="button" className="add-device-modal__btn add-device-modal__btn--cancel" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="add-device-modal__btn add-device-modal__btn--add" disabled={!canAdd}>
                Add Device
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
