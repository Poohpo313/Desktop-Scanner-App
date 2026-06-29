import type { ImgHTMLAttributes, SVGProps } from "react";
import { brandColors } from "../../theme/brand";

import iconUser from "../../icons/login/login-user.png";
import iconLock from "../../icons/login/login-lock.png";
import iconEye from "../../icons/Icon-200.svg";
import iconLogin from "../../icons/Icon-193.svg";

type IconProps = ImgHTMLAttributes<HTMLImageElement>;

function LoginIcon({ src, className, alt = "", ...rest }: IconProps & { src: string }) {
  return <img src={src} alt={alt} className={className} draggable={false} {...rest} />;
}

export const IconLoginUser = (p: IconProps) => <LoginIcon src={iconUser} {...p} />;
export const IconLoginLock = (p: IconProps) => <LoginIcon src={iconLock} {...p} />;
export const IconLoginEye = (p: IconProps) => <LoginIcon src={iconEye} {...p} />;
export const IconLoginArrow = (p: IconProps) => <LoginIcon src={iconLogin} {...p} />;

export function IconOfficerFieldUser({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="11" cy="8" r="3.25" stroke={brandColors.rainForestDark} strokeWidth="1.65" />
      <path
        d="M5.75 18.25C5.75 15.35 8.1 13 11 13C13.9 13 16.25 15.35 16.25 18.25"
        stroke={brandColors.rainForestDark}
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconOfficerFieldLock({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M7.5 10.5V8.25C7.5 6.4 9.15 4.75 11 4.75C12.85 4.75 14.5 6.4 14.5 8.25V10.5"
        stroke={brandColors.rainForestDark}
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="6.5"
        y="10.25"
        width="9"
        height="7.75"
        rx="1.35"
        stroke={brandColors.rainForestDark}
        strokeWidth="1.65"
      />
      <circle cx="11" cy="13.85" r="1.1" fill={brandColors.rainForestDark} />
    </svg>
  );
}

export function IconOfficerAccessUser({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="9" r="3.4" stroke={brandColors.rainForest} strokeWidth="1.75" />
      <path
        d="M6.25 18.75C6.25 15.85 8.85 13.5 12 13.5C15.15 13.5 17.75 15.85 17.75 18.75"
        stroke={brandColors.rainForest}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLoginCheck({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      width="14"
      height="11"
      viewBox="0 0 14 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M4.75 10.0208L0 5.27083L1.1875 4.08333L4.75 7.64583L12.3958 0L13.5833 1.1875L4.75 10.0208Z"
        fill={brandColors.white}
      />
    </svg>
  );
}
