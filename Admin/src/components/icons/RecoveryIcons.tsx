import type { ImgHTMLAttributes, SVGProps } from "react";

import iconMail from "../../icons/Icon-119.svg";
import iconPhone from "../../icons/Icon-64.svg";
import iconClock from "../../icons/Icon-60.svg";
import iconSend from "../../icons/Icon-147.svg";
import iconBack from "../../icons/Icon-68.svg";
import iconHeadset from "../../icons/Icon-129.svg";
import iconEmailAt from "../../icons/login/recovery-at.svg";
import iconSuccess from "../../icons/login/recovery-success-check.svg";
import iconPending from "../../icons/Icon-33.svg";

type IconProps = ImgHTMLAttributes<HTMLImageElement>;

function RecoveryIcon({ src, className, alt = "", ...rest }: IconProps & { src: string }) {
  return <img src={src} alt={alt} className={className} draggable={false} {...rest} />;
}

export const IconRecoveryMail = (p: IconProps) => <RecoveryIcon src={iconMail} {...p} />;
export const IconRecoveryPhone = (p: IconProps) => <RecoveryIcon src={iconPhone} {...p} />;
export const IconRecoveryClock = (p: IconProps) => <RecoveryIcon src={iconClock} {...p} />;
export const IconRecoverySend = (p: IconProps) => <RecoveryIcon src={iconSend} {...p} />;
export const IconRecoveryBack = (p: IconProps) => <RecoveryIcon src={iconBack} {...p} />;
export const IconRecoveryHeadset = (p: IconProps) => <RecoveryIcon src={iconHeadset} {...p} />;

export function IconRecoveryContactHelp({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M9.95 16C10.3 16 10.5958 15.8792 10.8375 15.6375C11.0792 15.3958 11.2 15.1 11.2 14.75C11.2 14.4 11.0792 14.1042 10.8375 13.8625C10.5958 13.6208 10.3 13.5 9.95 13.5C9.6 13.5 9.30417 13.6208 9.0625 13.8625C8.82083 14.1042 8.7 14.4 8.7 14.75C8.7 15.1 8.82083 15.3958 9.0625 15.6375C9.30417 15.8792 9.6 16 9.95 16ZM9.05 12.15H10.9C10.9 11.6 10.9625 11.1667 11.0875 10.85C11.2125 10.5333 11.5667 10.1 12.15 9.55C12.5833 9.11667 12.925 8.70417 13.175 8.3125C13.425 7.92083 13.55 7.45 13.55 6.9C13.55 5.96667 13.2083 5.25 12.525 4.75C11.8417 4.25 11.0333 4 10.1 4C9.15 4 8.37917 4.25 7.7875 4.75C7.19583 5.25 6.78333 5.85 6.55 6.55L8.2 7.2C8.28333 6.9 8.47083 6.575 8.7625 6.225C9.05417 5.875 9.5 5.7 10.1 5.7C10.6333 5.7 11.0333 5.84583 11.3 6.1375C11.5667 6.42917 11.7 6.75 11.7 7.1C11.7 7.43333 11.6 7.74583 11.4 8.0375C11.2 8.32917 10.95 8.6 10.65 8.85C9.91667 9.5 9.46667 9.99167 9.3 10.325C9.13333 10.6583 9.05 11.2667 9.05 12.15ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
        fill="#007a5e"
      />
    </svg>
  );
}
export function IconRecoveryInfo({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="8.33333" cy="8.33333" r="8.33333" fill="#007a5e" />
      <path
        d="M7.5 12.5H9.16667V7.5H7.5V12.5ZM8.33333 5.83333C8.56944 5.83333 8.76736 5.75347 8.92708 5.59375C9.08681 5.43403 9.16667 5.23611 9.16667 5C9.16667 4.76389 9.08681 4.56597 8.92708 4.40625C8.76736 4.24653 8.56944 4.16667 8.33333 4.16667C8.09722 4.16667 7.89931 4.24653 7.73958 4.40625C7.57986 4.56597 7.5 4.76389 7.5 5C7.5 5.23611 7.57986 5.43403 7.73958 5.59375C7.89931 5.75347 8.09722 5.83333 8.33333 5.83333Z"
        fill="white"
      />
    </svg>
  );
}
export const IconRecoveryEmailAt = (p: IconProps) => <RecoveryIcon src={iconEmailAt} {...p} />;
export const IconRecoverySuccess = (p: IconProps) => <RecoveryIcon src={iconSuccess} {...p} />;
export const IconRecoveryPending = (p: IconProps) => <RecoveryIcon src={iconPending} {...p} />;
export const IconRecoveryReviewClock = (p: IconProps) => <RecoveryIcon src={iconClock} {...p} />;
