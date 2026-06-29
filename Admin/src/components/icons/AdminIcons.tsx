import type { ImgHTMLAttributes } from "react";

import iconDashboard from "../../icons/Icon-198.svg";
import iconUserReg from "../../icons/sidebar-user-registration-icon.png";
import iconKeys from "../../icons/sidebar-keys-icon.png";
import iconDevices from "../../icons/sidebar-devices-icon.png";
import iconHelp from "../../icons/sidebar-help-icon.png";
import iconSettings from "../../icons/Icon-195.svg";
import iconLogout from "../../icons/Icon-193.svg";
import iconSearch from "../../icons/Icon-123.svg";
import iconRefresh from "../../icons/Icon-131.svg";
import iconBell from "../../icons/Icon-107.svg";
import iconUserPlus from "../../icons/Icon-202.svg";
import iconKeyGen from "../../icons/Icon-194.svg";
import iconMonitor from "../../icons/Icon-172.svg";
import iconAssist from "../../icons/Icon-201.svg";
import iconActivityUser from "../../icons/activity-user.svg";
import iconActivityKey from "../../icons/activity-key.svg";
import iconActivityDevice from "../../icons/activity-device.svg";
import iconActivityCheck from "../../icons/Success Animation/Icon-163.svg";
import iconAlertHigh from "../../icons/Icon-12.svg";
import iconViewDevices from "../../icons/Icon-200.svg";
import iconTotalUsers from "../../icons/dash-total-users-icon.png";
import iconActiveDevices from "../../icons/dash-active-devices-icon.png";
import iconAssignedKeys from "../../icons/dash-assigned-keys-icon.png";
import iconAvailableKeys from "../../icons/dash-available-keys-icon.png";
import iconNotifyUserPlus from "../../icons/dash-notification-user-plus-icon.svg";
import iconNotifyCheck from "../../icons/dash-notification-check-icon.svg";
import iconNotifyPending from "../../icons/dash-notification-pending-icon.svg";
import iconNotifyShieldCheck from "../../icons/dash-notification-shield-check-icon.svg";
import type { SVGProps } from "react";

type IconProps = ImgHTMLAttributes<HTMLImageElement>;
type SvgIconProps = SVGProps<SVGSVGElement>;

function FigmaIcon({ src, className, alt = "", ...rest }: IconProps & { src: string }) {
  return <img src={src} alt={alt} className={className} draggable={false} {...rest} />;
}

function SidebarNavIcon({ src, className, alt = "", ...rest }: IconProps & { src: string }) {
  return (
    <span className="admin-sidebar__link-icon" aria-hidden={alt === "" ? true : undefined}>
      <img
        src={src}
        alt={alt}
        className={`admin-sidebar__link-icon-img${className ? ` ${className}` : ""}`}
        draggable={false}
        {...rest}
      />
    </span>
  );
}

export const IconDashboard = (p: IconProps) => <SidebarNavIcon src={iconDashboard} {...p} />;
export const IconUserRegistration = (p: IconProps) => <SidebarNavIcon src={iconUserReg} {...p} />;
export const IconKeys = (p: IconProps) => <SidebarNavIcon src={iconKeys} {...p} />;
export const IconDevices = (p: IconProps) => <SidebarNavIcon src={iconDevices} {...p} />;
export const IconActiveDevices = (p: IconProps) => <FigmaIcon src={iconActiveDevices} {...p} />;
export const IconAssignedKeys = (p: IconProps) => <FigmaIcon src={iconAssignedKeys} {...p} />;
export const IconAvailableKeys = (p: IconProps) => <FigmaIcon src={iconAvailableKeys} {...p} />;

export function IconLicenseKeyUsed({ className, width = 24, height = 24, ...rest }: SvgIconProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="12" r="8.25" stroke="#1D63FF" strokeWidth="2" />
      <path
        d="M8.1 12.35L10.85 15.1L15.9 9.4"
        stroke="#1D63FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLicenseKeyUnused({ className, width = 24, height = 24, ...rest }: SvgIconProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <rect x="5.75" y="12.25" width="12.5" height="7.25" rx="2" stroke="#148230" strokeWidth="2" />
      <path
        d="M8.75 12.25V9.75C8.75 7.68 10.43 6 12.5 6C14.12 6 15.52 7.07 16 8.65"
        stroke="#148230"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const IconTotalUsers = (p: IconProps) => <FigmaIcon src={iconTotalUsers} {...p} />;
export const IconHelp = (p: IconProps) => <SidebarNavIcon src={iconHelp} {...p} />;
export const IconSettings = (p: IconProps) => <SidebarNavIcon src={iconSettings} {...p} />;
export const IconLogout = (p: IconProps) => <FigmaIcon src={iconLogout} {...p} />;
export const IconSearch = (p: IconProps) => <FigmaIcon src={iconSearch} {...p} />;
export const IconRefresh = (p: IconProps) => <FigmaIcon src={iconRefresh} {...p} />;
export const IconBell = (p: IconProps) => <FigmaIcon src={iconBell} {...p} />;

const HEADER_ICON_COLOR = "#4a4a4a";

export function IconHeaderRefresh({ className, ...rest }: SvgIconProps) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M18.25 10.75a7.25 7.25 0 1 0-1.35 4.25"
        stroke={HEADER_ICON_COLOR}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18.25 5.75v5h-5"
        stroke={HEADER_ICON_COLOR}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconHeaderBell({ className }: { className?: string }) {
  return (
    <span className={`admin-header__bell${className ? ` ${className}` : ""}`}>
      <svg width={20} height={22} viewBox="0 0 20 22" fill="none" aria-hidden="true">
        <path
          d="M10 2.1C7.58 2.1 5.65 4.03 5.65 6.45V10.95L3.4 13.2V14.4H16.6V13.2L14.35 10.95V6.45C14.35 4.03 12.42 2.1 10 2.1Z"
          stroke={HEADER_ICON_COLOR}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8.1 14.4C8.1 15.66 8.88 16.7 10 16.7C11.12 16.7 11.9 15.66 11.9 14.4"
          stroke={HEADER_ICON_COLOR}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="admin-header__bell-dot" aria-hidden="true" />
    </span>
  );
}
export const IconUserPlus = (p: IconProps) => <FigmaIcon src={iconUserPlus} {...p} />;

export function IconUserManagementRegister({ className, ...rest }: SvgIconProps) {
  return (
    <svg
      className={className}
      width={19}
      height={14}
      viewBox="0 0 19 14"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="6.667" cy="3.333" r="2.667" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M1.667 11.667C2.556 9.444 4.444 8.333 6.667 8.333C8.889 8.333 10.778 9.444 11.667 11.667"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M14.167 8.333V5.833H11.667V4.167H14.167V1.667H15.833V4.167H18.333V5.833H15.833V8.333H14.167Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconRegisteredUsers({ className, ...rest }: SvgIconProps) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="7.25" cy="5.75" r="2.4" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2.75 14.25C3.65 12.1 5.45 10.85 7.25 10.85C9.05 10.85 10.85 12.1 11.75 14.25"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <rect x="10.35" y="8.15" width="5.15" height="6.45" rx="1.1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11.55 10.55H14.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M11.55 12.2H13.55" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function IconRefreshList({ className, ...rest }: SvgIconProps) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M13.5 8.5C13.5 11.2614 11.2614 13.5 8.5 13.5C5.73858 13.5 3.5 11.2614 3.5 8.5C3.5 5.73858 5.73858 3.5 8.5 3.5C9.88071 3.5 11.1193 4.01116 12 4.85"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M12 2.5V5H9.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconExportUsers({ className, ...rest }: SvgIconProps) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 17 21"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M1.4 20.375L0 18.95L2.95 16H0.7V14H6.35V19.65H4.35V17.425L1.4 20.375ZM8.35 20V18H14.35V7H9.35V2H2.35V12H0.35V2C0.35 1.45 0.545833 0.979167 0.9375 0.5875C1.32917 0.195833 1.8 0 2.35 0H10.35L16.35 6V18C16.35 18.55 16.1542 19.0208 15.7625 19.4125C15.3708 19.8042 14.9 20 14.35 20H8.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

export const IconKeyGen = (p: IconProps) => <FigmaIcon src={iconKeyGen} {...p} />;
export const IconMonitor = (p: IconProps) => <FigmaIcon src={iconMonitor} {...p} />;
export const IconViewDevices = (p: IconProps) => <FigmaIcon src={iconViewDevices} {...p} />;
export const IconAssist = (p: IconProps) => <FigmaIcon src={iconAssist} {...p} />;
export const IconActivityUser = (p: IconProps) => <FigmaIcon src={iconActivityUser} {...p} />;
export const IconActivityKey = (p: IconProps) => <FigmaIcon src={iconActivityKey} {...p} />;
export const IconActivityDevice = (p: IconProps) => <FigmaIcon src={iconActivityDevice} {...p} />;
export const IconActivityCheck = (p: IconProps) => <FigmaIcon src={iconActivityCheck} {...p} />;
export const IconAlertHigh = (p: IconProps) => <FigmaIcon src={iconAlertHigh} {...p} />;

export const IconNotifyUserPlus = (p: IconProps) => <FigmaIcon src={iconNotifyUserPlus} {...p} />;
export const IconNotifyCheck = (p: IconProps) => <FigmaIcon src={iconNotifyCheck} {...p} />;
export const IconNotifyPending = (p: IconProps) => <FigmaIcon src={iconNotifyPending} {...p} />;
export const IconNotifyShieldCheck = (p: IconProps) => <FigmaIcon src={iconNotifyShieldCheck} {...p} />;

export function IconAlertMedium({ className, ...rest }: SvgIconProps) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="8" cy="8" r="7" stroke="#d68910" strokeWidth="1.5" />
      <path d="M8 4.5v4.25" stroke="#d68910" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.25" r="0.75" fill="#d68910" />
    </svg>
  );
}

export function IconAlertSync({ className, ...rest }: SvgIconProps) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M3.5 6.5a4.5 4.5 0 0 1 7.8-3"
        stroke="#d68910"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M12.5 9.5a4.5 4.5 0 0 1-7.8 3"
        stroke="#d68910"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M11 2.5h2v2M5 13.5H3v-2" stroke="#d68910" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
