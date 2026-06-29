/**
 * Bukolabs Figma asset registry — logos and UI icons from src/icons
 */
import bukolabsLogoPrimary from "./bukolabs-logo 1-1.png";
import bukolabsLogoAlt1 from "./bukolabs-logo 1.png";
import bukolabsLogoAlt2 from "./bukolabs-logo 2.png";
import bukolabsMark from "./Frame-29.svg";

import iconActivateUser from "./SVG.svg";
import iconEmail from "./SVG-4.svg";
import iconPhone from "./SVG-5.svg";
import iconShieldCheck from "./SVG-3.svg";
import iconCheck from "./SVG-6.svg";
import iconCheckGreen from "./SVG-8.svg";
import iconWarning from "./SVG-10.svg";
import iconHelp from "./Frame-9.svg";
import iconHelpLarge from "./SVG-11.svg";
import iconUser from "./Frame-11.svg";
import iconUserLarge from "./Frame-3.svg";
import iconLock from "./Frame-2.svg";
import iconLockLarge from "./Frame-5.svg";
import iconShield from "./Frame-6.svg";
import iconShieldWhite from "./Frame-8.svg";
import iconShieldMuted from "./Frame-16.svg";
import iconEye from "./Frame-1.svg";
import iconWifi from "./Frame-4.svg";
import iconWifiMuted from "./Frame-15.svg";
import iconCloud from "./Frame-19.svg";
import iconSearch from "./Frame-27.svg";
import iconSearchLarge from "./Frame-22.svg";
import iconPrint from "./Frame-28.svg";
import iconSettings from "./Frame-24.svg";
import iconDashboard from "./Frame-25.svg";
import iconCalendar from "./Frame-26.svg";
import iconScan from "./SVG-9.svg";
import iconDocuments from "./Frame-25.svg";
import iconChevron from "./Frame.svg";
import iconArrowRight from "./Frame-23.svg";
import iconSpinnerDot from "./div.dot-grid.svg";

export const logos = {
  /** Primary Bukolabs logo — use across splash, auth, sidebar */
  primary: bukolabsLogoPrimary,
  alt1: bukolabsLogoAlt1,
  alt2: bukolabsLogoAlt2,
  /** Colored leaf mark from Figma */
  mark: bukolabsMark,
} as const;

export const icons = {
  activateUser: iconActivateUser,
  email: iconEmail,
  phone: iconPhone,
  shieldCheck: iconShieldCheck,
  check: iconCheck,
  checkGreen: iconCheckGreen,
  warning: iconWarning,
  help: iconHelp,
  helpLarge: iconHelpLarge,
  user: iconUser,
  userLarge: iconUserLarge,
  lock: iconLock,
  lockLarge: iconLockLarge,
  shield: iconShield,
  shieldWhite: iconShieldWhite,
  shieldMuted: iconShieldMuted,
  eye: iconEye,
  wifi: iconWifi,
  wifiMuted: iconWifiMuted,
  cloud: iconCloud,
  search: iconSearch,
  searchLarge: iconSearchLarge,
  print: iconPrint,
  settings: iconSettings,
  dashboard: iconDashboard,
  calendar: iconCalendar,
  scan: iconScan,
  documents: iconDocuments,
  chevron: iconChevron,
  arrowRight: iconArrowRight,
  spinnerDot: iconSpinnerDot,
} as const;

export type IconName = keyof typeof icons;
export type LogoName = keyof typeof logos;
