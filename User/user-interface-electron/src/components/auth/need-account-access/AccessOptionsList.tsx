import { Mail, Smartphone, UserRoundPlus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  buildActivationEmailDescription,
  buildActivationPhysicalDescription,
  buildActivationSmsDescription,
} from "../adminSupportCopy";
import { useAdminSupportContact } from "../../../hooks/useAdminSupportContact";
import { AccessOptionCard } from "./AccessOptionCard";

function buildQuerySuffix(username?: string, serialKey?: string) {
  const params = new URLSearchParams();
  params.set("context", "activation");
  if (username) params.set("username", username);
  if (serialKey) params.set("serialKey", serialKey);
  return `?${params.toString()}`;
}

export function AccessOptionsList() {
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username")?.trim() || undefined;
  const serialKey = searchParams.get("serialKey")?.trim() || undefined;
  const { contact } = useAdminSupportContact({ username, serialKey });
  const querySuffix = buildQuerySuffix(username, serialKey);

  const options = [
    {
      to: `/request-email${querySuffix}`,
      icon: Mail,
      title: "Request through Email",
      description: buildActivationEmailDescription(contact),
    },
    {
      to: `/request-sms${querySuffix}`,
      icon: Smartphone,
      title: "Request through SMS",
      description: buildActivationSmsDescription(contact),
    },
    {
      to: "/activate",
      icon: UserRoundPlus,
      title: "Ask Admin Physically",
      description: buildActivationPhysicalDescription(contact),
    },
  ] as const;

  return (
    <div className="flex w-full flex-col gap-3">
      {options.map((option) => (
        <AccessOptionCard key={option.title} {...option} />
      ))}
    </div>
  );
}
