import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconUserDetailsBack({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUserDetailsUser({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 15.5C4.2 12.4 6.3 10.5 9 10.5C11.7 10.5 13.8 12.4 14.5 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconUserDetailsEmail({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <rect x="2.5" y="4.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 6L9 10.5L15.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUserDetailsPhone({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M5.5 3.5H7L8 7L6.5 8C7.4 10.2 9.8 12.6 12 13.5L13 12V14.5H15.5C15.7 15.6 16.6 16.5 17.7 16.7C17.8 16.7 17.9 16.7 18 16.7V15C18 8.9 13.1 4 7 4H5.5V3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUserDetailsCalendar({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <rect x="3" y="4" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 2.5V5M12 2.5V5M3 7.5H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconUserDetailsClock({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" {...rest}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.5V10L12.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconUserDetailsScan({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" {...rest}>
      <path d="M4 7V4H7M13 4H16V7M16 13V16H13M7 16H4V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="6.5" y="6.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconUserDetailsDocument({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" {...rest}>
      <path d="M6 3.5H11.5L14.5 6.5V16.5H6V3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M11.5 3.5V6.5H14.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 10H12.5M8 13H12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconUserDetailsDevice({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" {...rest}>
      <rect x="3" y="5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 16H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconAssignedLicenseSeal({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M16 2.2L18.1 4.1L20.8 3.4L21.8 6L24.4 6.8L24.2 9.5L26.6 11L25.4 13.5L27 15.8L25 17.8L25.4 20.5L23.2 22L23.8 24.7L21.2 25.2L20.4 27.8L17.8 27.4L16 29.4L14.2 27.4L11.6 27.8L10.8 25.2L8.2 24.7L8.8 22L6.6 20.5L7 17.8L5 15.8L6.6 13.5L5.4 11L7.8 9.5L7.6 6.8L10.2 6L11.2 3.4L13.9 4.1L16 2.2Z"
        fill="currentColor"
      />
      <path
        d="M11.5 16.2L14.2 18.9L20.5 12.6"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUserDetailsLicenseCheck({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 9L8 11L12.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUserDetailsKebab({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8" cy="4" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconUserDetailsChevronDown({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" {...rest}>
      <path d="M3.5 5.5L7 9L10.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconActivityReset({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path d="M3 8C3 5.2 5.2 3 8 3C9.5 3 10.9 3.7 11.8 4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M13 8C13 10.8 10.8 13 8 13C6.5 13 5.1 12.3 4.2 11.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11.5 2.5V5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 13.5V11H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconActivityKey({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="5.5" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7.5 8.5L13 3M11 3H13V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconActivityAccount({ className, ...rest }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 13.5C4.1 11 5.8 9.5 8 9.5C10.2 9.5 11.9 11 12.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
