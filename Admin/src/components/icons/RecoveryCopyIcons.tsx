import type { ImgHTMLAttributes, SVGProps } from "react";

import iconCheck from "../../icons/login/recovery-success-check.svg";
import iconClipboard from "../../icons/login/copy-clipboard-active.png";
import iconMail from "../../icons/login/copy-mail-open.png";
import iconPhone from "../../icons/login/copy-phone-handset.png";
import iconContactView from "../../icons/login/copy-contact-view.png";
import iconHelpHeader from "../../icons/login/recovery-help-header.png";
import iconHelpInfo from "../../icons/login/recovery-help-info.svg";
import iconHelpCopy from "../../icons/login/recovery-help-copy.png";
import iconHelpCopyField from "../../icons/login/recovery-help-copy-field.png";
import iconHelpCheck from "../../icons/login/recovery-help-check.svg";
import iconHelpShield from "../../icons/login/recovery-help-shield.png";
import iconHelpClock from "../../icons/login/recovery-help-clock.svg";
import iconContactEmail from "../../icons/login/view-contact-email-icon.png";
import iconContactPhone from "../../icons/login/view-contact-phone-icon.png";
import iconContactClock from "../../icons/login/view-contact-clock-icon.png";
import iconContactCopy from "../../icons/login/recovery-help-copy-field.png";
import iconContactOpen from "../../icons/login/view-contact-open-icon.png";
import iconContactSms from "../../icons/login/view-contact-sms-icon.png";
import iconContactShieldUser from "../../icons/login/contact-details-shield-user.svg";
import iconContactShieldCheck from "../../icons/login/recovery-help-shield.png";
import iconContactAvailable from "../../icons/login/recovery-help-check.svg";

type IconProps = ImgHTMLAttributes<HTMLImageElement>;

function CopyIcon({ src, className, alt = "", ...rest }: IconProps & { src: string }) {
  return <img src={src} alt={alt} className={className} draggable={false} aria-hidden={alt === "" ? true : undefined} {...rest} />;
}

export function IconCopiedSuccessCheck({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconCheck} className={className} {...rest} />;
}

export function IconCopiedClipboard({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconClipboard} className={className} {...rest} />;
}

export function IconCopiedMailOpen({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconMail} className={className} {...rest} />;
}

export function IconCopiedPhoneHandset({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconPhone} className={className} {...rest} />;
}

export function IconCopiedContactView({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactView} className={className} {...rest} />;
}

export function IconRecoveryHelpHeader({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconHelpHeader} className={className} {...rest} />;
}

export function IconRecoveryHelpInfo({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconHelpInfo} className={className} {...rest} />;
}

export function IconRecoveryHelpCopy({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconHelpCopy} className={className} {...rest} />;
}

export function IconRecoveryHelpCopyField({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconHelpCopyField} className={className} {...rest} />;
}

export function IconRecoveryHelpCheck({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconHelpCheck} className={className} {...rest} />;
}

export function IconRecoveryHelpShield({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconHelpShield} className={className} {...rest} />;
}

export function IconRecoveryHelpClock({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconHelpClock} className={className} {...rest} />;
}

export function IconContactDetailsEmail({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactEmail} className={className} {...rest} />;
}

export function IconContactDetailsPhone({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactPhone} className={className} {...rest} />;
}

export function IconContactDetailsClock({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactClock} className={className} {...rest} />;
}

export function IconContactDetailsCopy({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactCopy} className={className} {...rest} />;
}

export function IconContactDetailsOpen({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactOpen} className={className} {...rest} />;
}

export function IconContactDetailsSms({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactSms} className={className} {...rest} />;
}

export function IconContactDetailsShieldUser({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactShieldUser} className={className} {...rest} />;
}

export function IconContactDetailsShieldCheck({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactShieldCheck} className={className} {...rest} />;
}

export function IconContactDetailsAvailable({ className, ...rest }: IconProps) {
  return <CopyIcon src={iconContactAvailable} className={className} {...rest} />;
}

export function IconCopiedInfo({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8" cy="8" r="7.25" stroke="#007A5E" strokeWidth="1.25" fill="none" />
      <path
        d="M7.25 11.5H8.75V7.25H7.25V11.5ZM8 5.75C8.27614 5.75 8.5 5.52614 8.5 5.25C8.5 4.97386 8.27614 4.75 8 4.75C7.72386 4.75 7.5 4.97386 7.5 5.25C7.5 5.52614 7.72386 5.75 8 5.75Z"
        fill="#007A5E"
      />
    </svg>
  );
}

export function IconPhoneCopiedStatus({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" {...rest}>
      <circle cx="7" cy="7" r="6.25" stroke="#007A5E" strokeWidth="1.25" fill="none" />
      <path d="M4.25 7L6.1 8.85L9.75 5.2" stroke="#007A5E" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
