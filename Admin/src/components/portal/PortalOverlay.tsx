import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export default function PortalOverlay({ open, onClose, children, className }: Props) {
  if (!open) return null;

  return createPortal(
    <div
      className={`portal-backdrop portal-backdrop--center${className ? ` ${className}` : ""}`}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>,
    document.body
  );
}
