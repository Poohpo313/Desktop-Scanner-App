import type { ImgHTMLAttributes, SVGProps } from "react";

import emailSuccessCheck from "../../icons/login/email-success-check.svg";
import emailSuccessPending from "../../icons/login/email-success-pending.svg";
import emailSuccessId from "../../icons/login/email-success-id.png";
import emailSuccessUnderReview from "../../icons/login/email-success-under-review.svg";
import emailSuccessIdentityVerification from "../../icons/login/email-success-identity-verification.svg";
import emailSuccessCredentialsKey from "../../icons/login/email-success-credentials-key.svg";
import emailSuccessShieldCheck from "../../icons/login/email-success-shield-check.svg";
import emailSuccessNextInfo from "../../icons/login/email-success-next-info.svg";
import emailSuccessLogin from "../../icons/login/email-success-login.svg";
import emailSuccessEye from "../../icons/login/email-success-eye.svg";

type IconProps = ImgHTMLAttributes<HTMLImageElement>;

function EmailSuccessAsset({ src, className, alt = "", ...rest }: IconProps & { src: string }) {
  return <img src={src} className={className} alt={alt} aria-hidden={alt === "" ? true : undefined} {...rest} />;
}

export function IconEmailSuccessCheck({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessCheck} className={className} {...rest} />;
}

export function IconEmailSuccessPending({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessPending} className={className} {...rest} />;
}

export function IconEmailSuccessId({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessId} className={className} {...rest} />;
}

export function IconEmailSuccessUnderReview({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessUnderReview} className={className} {...rest} />;
}

export function IconEmailSuccessIdentityVerification({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessIdentityVerification} className={className} {...rest} />;
}

export function IconEmailSuccessCredentialsReleased({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessCredentialsKey} className={className} {...rest} />;
}

export function IconEmailSuccessShieldCheck({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessShieldCheck} className={className} {...rest} />;
}

export function IconEmailSuccessClock({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M9 18C6.7 18 4.69583 17.2375 2.9875 15.7125C1.27917 14.1875 0.3 12.2833 0.05 10H2.1C2.33333 11.7333 3.10417 13.1667 4.4125 14.3C5.72083 15.4333 7.25 16 9 16C10.95 16 12.6042 15.3208 13.9625 13.9625C15.3208 12.6042 16 10.95 16 9C16 7.05 15.3208 5.39583 13.9625 4.0375C12.6042 2.67917 10.95 2 9 2C7.85 2 6.775 2.26667 5.775 2.8C4.775 3.33333 3.93333 4.06667 3.25 5H6V7H0V1H2V3.35C2.85 2.28333 3.8875 1.45833 5.1125 0.875C6.3375 0.291667 7.63333 0 9 0C10.25 0 11.4208 0.2375 12.5125 0.7125C13.6042 1.1875 14.5542 1.82917 15.3625 2.6375C16.1708 3.44583 16.8125 4.39583 17.2875 5.4875C17.7625 6.57917 18 7.75 18 9C18 10.25 17.7625 11.4208 17.2875 12.5125C16.8125 13.6042 16.1708 14.5542 15.3625 15.3625C14.5542 16.1708 13.6042 16.8125 12.5125 17.2875C11.4208 17.7625 10.25 18 9 18ZM11.8 13.2L8 9.4V4H10V8.6L13.2 11.8L11.8 13.2Z"
        fill="#007a5e"
      />
    </svg>
  );
}

export function IconEmailSuccessStepCheck({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="12" height="10" viewBox="0 0 14 11" fill="none" aria-hidden="true" {...rest}>
      <path d="M4.75 10.0208L0 5.27083L1.1875 4.08333L4.75 7.64583L12.3958 0L13.5833 1.1875L4.75 10.0208Z" fill="#ffffff" />
    </svg>
  );
}

export function IconEmailSuccessStepCheckMuted({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="12" height="10" viewBox="0 0 14 11" fill="none" aria-hidden="true" {...rest}>
      <path d="M4.75 10.0208L0 5.27083L1.1875 4.08333L4.75 7.64583L12.3958 0L13.5833 1.1875L4.75 10.0208Z" fill="#b8c5c8" />
    </svg>
  );
}

export function IconEmailSuccessStepKey({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 20 18" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M14 5V2H6V5H4V0H16V5H14ZM2 7C2 7 2.09583 7 2.2875 7C2.47917 7 2.71667 7 3 7H17C17.2833 7 17.5208 7 17.7125 7C17.9042 7 18 7 18 7H16H4H2ZM16 9.5C16.2833 9.5 16.5208 9.40417 16.7125 9.2125C16.9042 9.02083 17 8.78333 17 8.5C17 8.21667 16.9042 7.97917 16.7125 7.7875C16.5208 7.59583 16.2833 7.5 16 7.5C15.7167 7.5 15.4792 7.59583 15.2875 7.7875C15.0958 7.97917 15 8.21667 15 8.5C15 8.78333 15.0958 9.02083 15.2875 9.2125C15.4792 9.40417 15.7167 9.5 16 9.5ZM14 16V12H6V16H14ZM16 18H4V14H0V8C0 7.15 0.291667 6.4375 0.875 5.8625C1.45833 5.2875 2.16667 5 3 5H17C17.85 5 18.5625 5.2875 19.1375 5.8625C19.7125 6.4375 20 7.15 20 8V14H16V18Z"
        fill="#b8c5c8"
      />
    </svg>
  );
}

export function IconEmailSuccessInfo({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessNextInfo} className={className} {...rest} />;
}

export function IconEmailSuccessShield({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 10 12" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M4.66667 11.6667C3.31528 11.3264 2.19965 10.551 1.31979 9.34062C0.439931 8.13021 0 6.78611 0 5.30833V1.75L4.66667 0L9.33333 1.75V5.30833C9.33333 6.78611 8.8934 8.13021 8.01354 9.34062C7.13368 10.551 6.01806 11.3264 4.66667 11.6667Z"
        fill="#007a5e"
      />
    </svg>
  );
}

export function IconEmailSuccessLogin({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessLogin} className={className} {...rest} />;
}

export function IconEmailSuccessEye({ className, ...rest }: IconProps) {
  return <EmailSuccessAsset src={emailSuccessEye} className={className} {...rest} />;
}
