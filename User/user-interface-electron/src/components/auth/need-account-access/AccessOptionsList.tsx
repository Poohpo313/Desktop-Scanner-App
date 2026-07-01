import { useMemo, useState } from "react";
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
  const initialUsername = searchParams.get("username")?.trim() || "";
  const initialSerialKey = searchParams.get("serialKey")?.trim() || "";
  const [usernameInput, setUsernameInput] = useState(initialUsername);
  const [serialKeyInput, setSerialKeyInput] = useState(initialSerialKey);
  const username = usernameInput.trim() || undefined;
  const serialKey = serialKeyInput.trim() || undefined;
  const { contact } = useAdminSupportContact({ username, serialKey });
  const querySuffix = useMemo(
    () => buildQuerySuffix(username, serialKey),
    [username, serialKey],
  );

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
      <label className="flex w-full flex-col gap-2 text-left">
        <span className="font-sans text-[13px] font-semibold text-[#334155]">Your username</span>
        <input
          className="w-full rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2.5 font-sans text-[14px] text-[#0F172A]"
          value={usernameInput}
          placeholder="Enter your username to load your administrator (Super Admin shown if empty)"
          onChange={(event) => setUsernameInput(event.target.value)}
          autoComplete="username"
        />
      </label>

      <label className="flex w-full flex-col gap-2 text-left">
        <span className="font-sans text-[13px] font-semibold text-[#334155]">
          Your serial key (optional)
        </span>
        <input
          className="w-full rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2.5 font-sans text-[14px] text-[#0F172A]"
          value={serialKeyInput}
          placeholder="Or enter your serial key"
          onChange={(event) => setSerialKeyInput(event.target.value)}
          autoComplete="off"
        />
      </label>

      {options.map((option) => (
        <AccessOptionCard key={option.title} {...option} />
      ))}
    </div>
  );
}
