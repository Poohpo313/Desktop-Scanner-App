import assetMap from "../../figma-asset-map.json";
import manifest from "../../screens-manifest.json";

const FIGMA_FILE_KEY = "IlPkS1UqnhECqi8qIIJyIb";

export type FigmaScreenMeta = {
  slug: string;
  name: string;
  figmaId: string;
  asset: string | null;
  embedUrl: string;
  htmlPath: string;
};

export function figmaEmbedUrl(figmaId: string): string {
  const nodeId = figmaId.replace(":", "-");
  return `https://embed.figma.com/design/${FIGMA_FILE_KEY}/DESKTOP-SCANNER-TEAM-BISU?node-id=${nodeId}&embed-host=share`;
}

type ManifestEntry = { id: string; name: string; slug: string; fileSlug: string };

const assets = assetMap as Record<string, string | null>;

export const figmaScreenCatalog: Record<string, FigmaScreenMeta> = Object.fromEntries(
  (manifest as ManifestEntry[]).map((entry) => {
    const slug = entry.slug;
    const asset = assets[slug] ?? null;
    return [
      slug,
      {
        slug,
        name: entry.name,
        figmaId: entry.id,
        asset,
        embedUrl: figmaEmbedUrl(entry.id),
        htmlPath: `/screens/${slug}.html`,
      },
    ];
  })
);

figmaScreenCatalog["welcome-screen"] = {
  slug: "welcome-screen",
  name: "Welcome Screen",
  figmaId: "1802:1272",
  asset: null,
  embedUrl: figmaEmbedUrl("1802:1272"),
  htmlPath: "/welcome",
};

export function getFigmaScreen(slug: string): FigmaScreenMeta | undefined {
  return figmaScreenCatalog[slug];
}

export const routeFigmaSlug: Record<string, string> = {
  "/welcome": "welcome-screen",
  "/login": "section-1-1-returning-user-login",
  "/forgot": "forgot-password",
  "/request-email": "request-through-email",
  "/request-sms": "request-through-sms",
  "/request-sent": "request-sent-successfully",
  "/need-account-access": "need-account-access",
  "/checking": "checking-credentials",
  "/activate": "section-1-2-activate-account",
  "/validating-key": "validating-serial-key",
  "/activated": "account-activated",
  "/checking-connection": "checking-connection",
  "/connection-check": "checking-connection",
  "/no-internet": "no-internet-connection",
  "/dashboard": "section-02-dashboard",
  "/offline-dashboard": "section-offline-dashboard",
  "/scan": "section-03-scan",
  "/files": "section-04-documents",
  "/search": "section-05-search",
  "/devices": "section-06-devices",
  "/settings": "section-07-settings",
  "/help": "section-08-about",
  "/print": "print-saved-document",
  "/cloud": "section-cloud-storage",
  "/reports": "section-09-help-assistant",
};
