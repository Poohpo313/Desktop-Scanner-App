import type { ImgHTMLAttributes, SVGProps } from "react";

import iconComposeShield from "../../icons/login/compose-recovery-shield.png";
import iconFooterShield from "../../icons/Footer Brand/Footer Brand/Icon-41.svg";

export function IconComposeShield({ className, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={iconComposeShield}
      alt=""
      className={className}
      width={72}
      height={72}
      draggable={false}
      aria-hidden="true"
      {...rest}
    />
  );
}

export function IconComposeLock({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M4 7V5C4 3.34315 5.34315 2 7 2C8.65685 2 10 3.34315 10 5V7H11C11.5523 7 12 7.44772 12 8V13C12 13.5523 11.5523 14 11 14H3C2.44772 14 2 13.5523 2 13V8C2 7.44772 2.44772 7 3 7H4ZM5.5 7H8.5V5C8.5 4.17157 7.82843 3.5 7 3.5C6.17157 3.5 5.5 4.17157 5.5 5V7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconComposeSend({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true" {...rest}>
      <path d="M0 13.3333V8.33333L6.66667 6.66667L0 5V0L15.8333 6.66667L0 13.3333Z" fill="currentColor" />
    </svg>
  );
}

export function IconComposePortalGlobe({ className, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={iconFooterShield} alt="" className={className} width={10} height={12} draggable={false} aria-hidden="true" {...rest} />;
}

export function IconComposeInfo({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8.33333" cy="8.33333" r="8.33333" fill="currentColor" />
      <path
        d="M7.5 12.5H9.16667V7.5H7.5V12.5ZM8.33333 5.83333C8.56944 5.83333 8.76736 5.75347 8.92708 5.59375C9.08681 5.43403 9.16667 5.23611 9.16667 5C9.16667 4.76389 9.08681 4.56597 8.92708 4.40625C8.76736 4.24653 8.56944 4.16667 8.33333 4.16667C8.09722 4.16667 7.89931 4.24653 7.73958 4.40625C7.57986 4.56597 7.5 4.76389 7.5 5C7.5 5.23611 7.57986 5.43403 7.73958 5.59375C7.89931 5.75347 8.09722 5.83333 8.33333 5.83333Z"
        fill="var(--color-white)"
      />
    </svg>
  );
}
