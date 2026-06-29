import type { ImgHTMLAttributes, SVGProps } from "react";

import iconHeader from "../../icons/login/send-recovery-sms-header.png";
import iconVerified from "../../icons/login/send-recovery-sms-verified.svg";
import iconBack from "../../icons/login/send-recovery-sms-back.svg";
import iconSend from "../../icons/login/send-recovery-sms-send.svg";
import iconInfo from "../../icons/login/sms-success-info.svg";
import iconSuccess from "../../icons/login/recovery-success-check.svg";
import iconPending from "../../icons/login/email-success-pending.svg";
import iconLogin from "../../icons/login/email-success-login.svg";
import iconEye from "../../icons/login/email-success-eye.svg";
import { IconComposeLock } from "./ComposeEmailIcons";

export { IconComposeLock };

type IconProps = ImgHTMLAttributes<HTMLImageElement>;

function SmsIcon({ src, className, alt = "", ...rest }: IconProps & { src: string }) {
  return <img src={src} alt={alt} className={className} draggable={false} aria-hidden={alt === "" ? true : undefined} {...rest} />;
}

export function IconSendRecoverySmsHeader({ className, ...rest }: IconProps) {
  return (
    <SmsIcon
      src={iconHeader}
      className={className}
      width={44}
      height={44}
      {...rest}
    />
  );
}

export function IconSendRecoverySmsVerified({ className, ...rest }: IconProps) {
  return <SmsIcon src={iconVerified} className={className} {...rest} />;
}

export function IconSendRecoverySmsBack({ className, ...rest }: IconProps) {
  return <SmsIcon src={iconBack} className={className} {...rest} />;
}

export function IconSendRecoverySmsSend({ className, ...rest }: IconProps) {
  return <SmsIcon src={iconSend} className={className} {...rest} />;
}

export function IconSmsSuccessInfo({ className, ...rest }: IconProps) {
  return <SmsIcon src={iconInfo} className={className} {...rest} />;
}

export function IconSmsSuccessCheck({ className, ...rest }: IconProps) {
  return <SmsIcon src={iconSuccess} className={className} {...rest} />;
}

export function IconSmsSuccessPending({ className, ...rest }: IconProps) {
  return <SmsIcon src={iconPending} className={className} {...rest} />;
}

export function IconSmsSuccessLogin({ className, ...rest }: IconProps) {
  return <SmsIcon src={iconLogin} className={className} {...rest} />;
}

export function IconSmsSuccessEye({ className, ...rest }: IconProps) {
  return <SmsIcon src={iconEye} className={className} {...rest} />;
}

export function IconSendRecoverySmsNotice({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8.33333" cy="8.33333" r="8.33333" fill="#007a5e" />
      <path
        d="M7.5 12.5H9.16667V7.5H7.5V12.5ZM8.33333 5.83333C8.56944 5.83333 8.76736 5.75347 8.92708 5.59375C9.08681 5.43403 9.16667 5.23611 9.16667 5C9.16667 4.76389 9.08681 4.56597 8.92708 4.40625C8.76736 4.24653 8.56944 4.16667 8.33333 4.16667C8.09722 4.16667 7.89931 4.24653 7.73958 4.40625C7.57986 4.56597 7.5 4.76389 7.5 5C7.5 5.23611 7.57986 5.43403 7.73958 5.59375C7.89931 5.75347 8.09722 5.83333 8.33333 5.83333Z"
        fill="white"
      />
    </svg>
  );
}
