import { icons, type IconName } from "../icons";
import { FigmaIcon } from "./FigmaIcon";

type IconProps = { className?: string };

function navIcon(name: IconName) {
  return function NavIcon({ className = "w-5 h-5" }: IconProps) {
    return <FigmaIcon name={name} className={className} inverse />;
  };
}

export const IconDashboard = navIcon("dashboard");
export const IconScan = navIcon("scan");
export const IconFolder = navIcon("documents");
export const IconSearch = navIcon("search");
export const IconPrint = navIcon("print");
export const IconSettings = navIcon("settings");
export const IconCloud = navIcon("cloud");
export const IconChart = navIcon("calendar");
export const IconHelp = navIcon("help");

export function IconDevices({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export function IconCheck({ className = "w-5 h-5" }: IconProps) {
  return <FigmaIcon name="checkGreen" className={className} />;
}

export function IconSpinner({ className = "w-10 h-10" }: IconProps) {
  return (
    <img
      src={icons.spinnerDot}
      alt=""
      className={`${className} animate-spin object-contain`}
      aria-hidden
    />
  );
}

export { FigmaIcon };
