import type { ImgHTMLAttributes, SVGProps } from "react";

import iconCheck from "../../icons/login/recovery-status-step-check.svg";
import iconCurrent from "../../icons/login/recovery-status-step-current.svg";
import iconPending from "../../icons/login/recovery-status-step-pending.svg";
import iconContactAdmin from "../../icons/login/recovery-status-contact-admin.png";
import iconRefresh from "../../icons/login/recovery-status-refresh.svg";

type IconProps = ImgHTMLAttributes<HTMLImageElement>;

function StatusIcon({ src, className, alt = "", ...rest }: IconProps & { src: string }) {
  return <img src={src} alt={alt} className={className} draggable={false} aria-hidden={alt === "" ? true : undefined} {...rest} />;
}

export function IconRecoveryStatusStepCheck({ className, ...rest }: IconProps) {
  return <StatusIcon src={iconCheck} className={className} {...rest} />;
}

export function IconRecoveryStatusStepCurrent({ className, ...rest }: IconProps) {
  return <StatusIcon src={iconCurrent} className={className} {...rest} />;
}

export function IconRecoveryStatusStepPending({ className, ...rest }: IconProps) {
  return <StatusIcon src={iconPending} className={className} {...rest} />;
}

export function IconRecoveryStatusContactClock({ className, ...rest }: IconProps) {
  return <StatusIcon src={iconContactAdmin} className={className} width={16} height={16} {...rest} />;
}

export function IconRecoveryStatusRefresh({ className, ...rest }: IconProps) {
  return <StatusIcon src={iconRefresh} className={className} {...rest} />;
}

export function IconRecoveryStatusAdminInfo({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8" cy="8" r="7.25" stroke="#007A5E" stroke-width="1.25" fill="none" />
      <path
        d="M7.25 11.5H8.75V7.25H7.25V11.5ZM8 5.75C8.27614 5.75 8.5 5.52614 8.5 5.25C8.5 4.97386 8.27614 4.75 8 4.75C7.72386 4.75 7.5 4.97386 7.5 5.25C7.5 5.52614 7.72386 5.75 8 5.75Z"
        fill="#007A5E"
      />
    </svg>
  );
}
