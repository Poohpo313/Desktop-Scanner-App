import type { ReactNode, SVGProps } from "react";

import iconCopyEmail from "../../icons/Icon-236.svg";
import iconCopyPhone from "../../icons/Icon-235.svg";
import iconSendSms from "../../icons/Icon-238.svg";

type IconProps = SVGProps<SVGSVGElement> & { selected?: boolean };
type MethodIconProps = { selected?: boolean; className?: string };

const GLYPH = "#3E4946";
const GLYPH_SELECTED = "#ffffff";

function MethodGlyph({ selected, className, children }: { selected?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={`contact-super-admin__card-icon-shell${selected ? " contact-super-admin__card-icon-shell--selected" : ""}${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}

function MethodImgIcon({ selected, className, src, width = 18, height = 18 }: MethodIconProps & { src: string; width?: number; height?: number }) {
  return (
    <MethodGlyph selected={selected} className={className}>
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        className="contact-method-icon__img"
        aria-hidden="true"
        draggable={false}
      />
    </MethodGlyph>
  );
}

export function IconContactMethodEmail({ selected, className, ...rest }: IconProps) {
  const stroke = selected ? GLYPH_SELECTED : GLYPH;
  return (
    <MethodGlyph selected={selected} className={className}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
        <path
          d="M10.6667 6.66667V8.66667C10.6667 9.58714 11.4129 10.3333 12.3333 10.3333C13.2538 10.3333 14 9.58714 14 8.66667V8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C9.10457 14 10.1491 13.6842 11.0333 13.1333"
          stroke={stroke}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 10.6667C9.47276 10.6667 10.6667 9.47276 10.6667 8C10.6667 6.52724 9.47276 5.33333 8 5.33333C6.52724 5.33333 5.33333 6.52724 5.33333 8C5.33333 9.47276 6.52724 10.6667 8 10.6667Z"
          stroke={stroke}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </MethodGlyph>
  );
}

export function IconContactMethodSms({ selected, className }: MethodIconProps) {
  return <MethodImgIcon selected={selected} className={className} src={iconSendSms} width={18} height={18} />;
}

export function IconContactMethodCopyEmail({ selected, className }: MethodIconProps) {
  return <MethodImgIcon selected={selected} className={className} src={iconCopyEmail} width={16} height={18} />;
}

export function IconContactMethodCopyPhone({ selected, className }: MethodIconProps) {
  return <MethodImgIcon selected={selected} className={className} src={iconCopyPhone} width={13} height={18} />;
}

export function IconContactCheck({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <circle cx="9" cy="9" r="9" fill="#007a5e" />
      <path d="M5 9.2L7.6 11.8L13 6.4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconContactProfileMail({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 20 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H2ZM10 9L2 4V14H18V4L10 9ZM10 7L18 2H2L10 7Z"
        fill="#8ea0a3"
      />
    </svg>
  );
}

export function IconContactProfilePhone({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M16.95 18C14.8667 18 12.8083 17.5458 10.775 16.6375C8.74167 15.7292 6.89167 14.4417 5.225 12.775C3.55833 11.1083 2.27083 9.25833 1.3625 7.225C0.454167 5.19167 0 3.13333 0 1.05C0 0.75 0.1 0.5 0.3 0.3C0.5 0.1 0.75 0 1.05 0H5.1C5.33333 0 5.54167 0.0791667 5.725 0.2375C5.90833 0.395833 6.01667 0.583333 6.05 0.8L6.7 4.3C6.73333 4.56667 6.725 4.79167 6.675 4.975C6.625 5.15833 6.53333 5.31667 6.4 5.45L3.975 7.9C4.30833 8.51667 4.70417 9.1125 5.1625 9.6875C5.62083 10.2625 6.125 10.8167 6.675 11.35C7.19167 11.8667 7.73333 12.3458 8.3 12.7875C8.86667 13.2292 9.46667 13.6333 10.1 14L12.45 11.65C12.6 11.5 12.7958 11.3875 13.0375 11.3125C13.2792 11.2375 13.5167 11.2167 13.75 11.25L17.2 11.95C17.4333 12.0167 17.625 12.1375 17.775 12.3125C17.925 12.4875 18 12.6833 18 12.9V16.95C18 17.25 17.9 17.5 17.7 17.7C17.5 17.9 17.25 18 16.95 18Z"
        fill="#8ea0a3"
      />
    </svg>
  );
}

export function IconContactProfileClock({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 18 20" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V0H5V2H13V0H15V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H2ZM2 18H16V8H2V18ZM2 6H16V4H2V6Z"
        fill="#8ea0a3"
      />
    </svg>
  );
}
