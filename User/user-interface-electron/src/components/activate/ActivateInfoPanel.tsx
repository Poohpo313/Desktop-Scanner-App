import { BukolabsBrand } from "../brand/BukolabsBrand";
import { FeatureItem } from "./FeatureItem";

const FEATURES = [
  {
    icon: "user" as const,
    title: "Admin-assigned account",
    description: "Access is granted and managed by your administrator.",
  },
  {
    icon: "shieldCheck" as const,
    title: "Serial key verification",
    description: "Your unique key ensures secure workspace activation.",
  },
  {
    icon: "shield" as const,
    title: "Secure local access",
    description: "Your data stays on your device with enterprise-grade security.",
  },
];

export function ActivateInfoPanel() {
  return (
    <aside className="activate-info" aria-label="Activation information">
      <BukolabsBrand variant="auth" className="activate-info__brand" />

      <div className="activate-info__welcome">
        <p className="activate-info__kicker">Welcome to</p>
        <h1 className="activate-info__title">Desktop Scanner</h1>
        <p className="activate-info__desc">Activate your workspace using assigned access.</p>
      </div>

      <div className="activate-info__features">
        {FEATURES.map((item) => (
          <FeatureItem
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </aside>
  );
}
