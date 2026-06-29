export const GATEWAY_SETTINGS_SECTION_ID = "gateway-server-settings";

export const GATEWAY_SETTINGS_NAV_STATE = {
  tab: "general",
  focusGateway: true,
} as const;

export function scrollToGatewaySettings() {
  window.setTimeout(() => {
    const section = document.getElementById(GATEWAY_SETTINGS_SECTION_ID);
    section?.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = section?.querySelector<HTMLInputElement>(".gateway-server-panel__input");
    input?.focus();
  }, 150);
}
