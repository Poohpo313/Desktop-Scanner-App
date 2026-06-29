import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Smartphone, UserRoundPlus } from "lucide-react";
import {
  buildForgotEmailDescription,
  buildForgotSmsDescription,
  buildPhysicalAdminDescription,
} from "../adminSupportCopy";
import { useAdminSupportContact } from "../../../hooks/useAdminSupportContact";
import { AccessOptionCard } from "../need-account-access/AccessOptionCard";

function buildQuerySuffix(username: string) {
  return username ? `?context=forgot&username=${encodeURIComponent(username)}` : "?context=forgot";
}

export function ForgotPasswordOptionsList() {
  const [searchParams] = useSearchParams();
  const initialUsername = searchParams.get("username")?.trim() || "";
  const [usernameInput, setUsernameInput] = useState(initialUsername);
  const username = usernameInput.trim() || undefined;
  const { contact } = useAdminSupportContact({ username });

  const querySuffix = useMemo(() => buildQuerySuffix(username ?? ""), [username]);

  const options = [
    {
      to: `/request-email${querySuffix}`,
      icon: Mail,
      title: "Request through Email",
      description: buildForgotEmailDescription(contact),
    },
    {
      to: `/request-sms${querySuffix}`,
      icon: Smartphone,
      title: "Request through SMS",
      description: buildForgotSmsDescription(contact),
    },
    {
      to: "/login",
      icon: UserRoundPlus,
      title: "Ask Admin Physically",
      description: buildPhysicalAdminDescription(contact),
    },
  ] as const;

  return (
    <div className="flex w-full flex-col gap-3">
      <label className="flex w-full flex-col gap-2 text-left">
        <span className="font-sans text-[13px] font-semibold text-[#334155]">Your username</span>
        <input
          className="w-full rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2.5 font-sans text-[14px] text-[#0F172A]"
          value={usernameInput}
          placeholder="Enter your username to load admin contact"
          onChange={(event) => setUsernameInput(event.target.value)}
          autoComplete="username"
        />
      </label>

      {options.map((option) => (
        <AccessOptionCard key={option.title} {...option} />
      ))}
    </div>
  );
}
