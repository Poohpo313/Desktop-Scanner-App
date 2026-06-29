import type { ReactNode } from "react";

type Props = { open: boolean; title: string; onClose: () => void; children: ReactNode; hideHeader?: boolean };

export default function Modal({ open, title, onClose, children, hideHeader = false }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {!hideHeader && (
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-lg font-semibold text-brand-dark">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-transparent hover:bg-slate-100"
            >
              <span className="absolute h-0.5 w-3.5 rotate-45 rounded-full bg-slate-500" aria-hidden="true" />
              <span className="absolute h-0.5 w-3.5 -rotate-45 rounded-full bg-slate-500" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className={hideHeader ? "p-6" : "p-5"}>{children}</div>
      </div>
    </div>
  );
}
