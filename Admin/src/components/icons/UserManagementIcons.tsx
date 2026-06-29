import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconUserMgmtView({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M1 9C2.8 4.9 5.6 3 9 3C12.4 3 15.2 4.9 17 9C15.2 13.1 12.4 15 9 15C5.6 15 2.8 13.1 1 9Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2.35" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

export function IconUserMgmtEdit({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M12.45 2.55L15.45 5.55L6.25 14.75H3.25V11.75L12.45 2.55ZM12.45 2.55L14.35 4.45M2 16H16"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUserMgmtDeactivate({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M3.25 5.5H14.75M6.25 5.5V4.25C6.25 3.83579 6.58579 3.5 7 3.5H11C11.4142 3.5 11.75 3.83579 11.75 4.25V5.5M7 8.25V12.25M11 8.25V12.25M4.75 5.5L5.5 14.25C5.5 14.6642 5.83579 15 6.25 15H11.75C12.1642 15 12.5 14.6642 12.5 14.25L13.25 5.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUserMgmtReactivate({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <circle cx="9" cy="6.5" r="2.75" stroke="currentColor" strokeWidth="1.35" />
      <path d="M4 15.5C4.8 12.8 6.6 11 9 11C11.4 11 13.2 12.8 14 15.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M6.5 9L8.5 11L11.5 7.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUserMgmtDelete({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M3.25 5.5H14.75M6.25 5.5V4.25C6.25 3.83579 6.58579 3.5 7 3.5H11C11.4142 3.5 11.75 3.83579 11.75 4.25V5.5M7 8.25V12.25M11 8.25V12.25M4.75 5.5L5.5 14.25C5.5 14.6642 5.83579 15 6.25 15H11.75C12.1642 15 12.5 14.6642 12.5 14.25L13.25 5.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
