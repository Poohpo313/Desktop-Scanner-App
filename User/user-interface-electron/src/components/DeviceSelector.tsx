import type { ScanDevice } from "../hooks/useScanner";
import { IconCheck } from "./icons";

type Props = {
  devices: ScanDevice[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

export function DeviceSelector({ devices, selectedId, onSelect, disabled }: Props) {
  if (devices.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No device found. Connect a scanner and refresh.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {devices.map((d) => {
        const selected = d.id === selectedId;
        return (
          <button
            key={d.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(d.id)}
            className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition disabled:opacity-50 ${
              selected
                ? "border-brand-emerald bg-brand-mint/30"
                : "border-brand-border bg-white hover:border-brand-emerald/50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-panel text-brand-emerald shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10v10H7V7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{d.name}</p>
              <p className="text-xs text-gray-500">{d.driver} · {d.type}</p>
            </div>
            {selected ? (
              <span className="flex items-center gap-1 text-xs font-medium text-brand-emerald shrink-0">
                <IconCheck className="w-4 h-4" />
                Selected
              </span>
            ) : (
              <span className="text-xs text-brand-emerald shrink-0">Select</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
