import packageJson from "../../../package.json";

export type ReleaseNote = {
  version: string;
  date: string;
  highlights: string[];
};

export type ThirdPartyLicense = {
  name: string;
  license: string;
  notice?: string;
};

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "1.0.0",
    date: "June 2026",
    highlights: [
      "Document scanning with optional OCR and local folder organization",
      "Serial key activation and online account sync with Bukolabs gateway",
      "Device registration, heartbeat presence, and printer integration",
      "Secure local storage with configurable save locations and file types",
    ],
  },
];

export const THIRD_PARTY_LICENSES: ThirdPartyLicense[] = [
  { name: "React", license: "MIT" },
  { name: "React DOM", license: "MIT" },
  { name: "React Router", license: "MIT" },
  { name: "Electron", license: "MIT" },
  { name: "Vite", license: "MIT" },
  { name: "pdf-lib", license: "MIT" },
  { name: "pg (node-postgres)", license: "MIT" },
  { name: "argon2", license: "MIT" },
  { name: "lucide-react", license: "ISC" },
  { name: "uuid", license: "MIT" },
  { name: "react-easy-crop", license: "MIT" },
];

export function getAppMetadata() {
  const version = packageJson.version ?? "1.0.0";
  const latestRelease = RELEASE_NOTES[0];
  return {
    name: "Desktop Scanner",
    version,
    buildLabel: version.replace(/\./g, ""),
    releaseDate: latestRelease?.date ?? "2026",
    copyrightYear: new Date().getFullYear(),
  };
}
