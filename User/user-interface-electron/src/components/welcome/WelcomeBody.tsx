import { ActionCard } from "./ActionCard";
import { FeatureCard } from "./FeatureCard";
import { WelcomeHeader } from "./WelcomeHeader";

const FEATURES = [
  {
    icon: "shield" as const,
    title: "Assigned Access",
    description: "Only authorized users can access the scanner.",
  },
  {
    icon: "lock" as const,
    title: "Access Key Check",
    description: "Validates access before enabling features.",
  },
  {
    icon: "cloud" as const,
    title: "Online / Offline",
    description: "Works seamlessly online or offline.",
  },
];

export function WelcomeBody() {
  return (
    <section className="welcome-body">
      <WelcomeHeader />

      <div className="welcome-body__actions">
        <ActionCard
          to="/login"
          icon="user"
          title="Returning User"
          description="Sign in to your assigned account"
        />
        <ActionCard
          to="/activate"
          icon="lockLarge"
          title="Activate Account"
          description="Use your admin-provided access key"
        />
      </div>

      <div className="welcome-body__features">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}
