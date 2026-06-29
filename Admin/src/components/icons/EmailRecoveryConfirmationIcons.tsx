import type { SVGProps } from "react";

export function IconFooterSecure({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M7 1.75L3 3.5V6.75C3 9.35 4.86 11.73 7 12.6C9.14 11.73 11 9.35 11 6.75V3.5L7 1.75Z"
        fill="#E74C3C"
      />
    </svg>
  );
}

export function IconFooterRoleAccess({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true" {...rest}>
      <circle cx="7" cy="4.75" r="2.1" fill="#4A7FD4" />
      <path
        d="M3.25 11.5C3.25 9.4 4.95 7.75 7 7.75C9.05 7.75 10.75 9.4 10.75 11.5"
        stroke="#4A7FD4"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconFooterDataProtected({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true" {...rest}>
      <rect x="3.25" y="6.25" width="7.5" height="5.5" rx="1.1" fill="#F39C12" />
      <path
        d="M4.75 6.25V5.1C4.75 3.85 5.75 2.85 7 2.85C8.25 2.85 9.25 3.85 9.25 5.1V6.25"
        stroke="#F39C12"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}
