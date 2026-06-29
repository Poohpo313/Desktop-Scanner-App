import { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { getFigmaScreen } from "../../figma/figmaScreenCatalog";
import { AuthFlowScreen } from "../auth/AuthFlowScreen";
import { NeedAccountAccessScreen } from "../auth/NeedAccountAccessScreen";
import { RequestEmailScreen } from "../auth/RequestEmailScreen";
import { CheckingConnectionScreen } from "../auth/CheckingConnectionScreen";
import { CheckingCredentialsScreen } from "../auth/CheckingCredentialsScreen";
import { ForgotPasswordScreen } from "../auth/ForgotPasswordScreen";
import { ValidatingSerialKeyScreen } from "../auth/ValidatingSerialKeyScreen";
import { AccountActivatedScreen } from "../auth/AccountActivatedScreen";
import { NoInternetConnectionScreen } from "../auth/no-internet-connection";
import { RequestSentScreen } from "../auth/RequestSentScreen";
import { RequestSmsScreen } from "../auth/RequestSmsScreen";
import "../../styles/prototype-screen.css";

type Props = {
  slug: string;
  variant?: "full" | "inShell";
  className?: string;
  children?: ReactNode;
};

function ShellPanel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="proto-panel">
      <header className="proto-panel__header">
        <h2 className="proto-panel__title">{title}</h2>
        {subtitle ? <p className="proto-panel__subtitle">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

function AuthFormStub({ title, fields, backTo }: { title: string; fields: string[]; backTo: string }) {
  function onSubmit(e: FormEvent) {
    e.preventDefault();
  }
  return (
    <div className="proto-auth-form">
      <Link to={backTo} className="proto-auth-form__back">← Back</Link>
      <h1 className="proto-auth-form__title">{title}</h1>
      <form onSubmit={onSubmit} className="proto-auth-form__form">
        {fields.map((f) => (
          <label key={f} className="proto-auth-form__field">
            <span>{f}</span>
            <input type="text" placeholder={`Enter ${f.toLowerCase()}`} />
          </label>
        ))}
        <button type="submit" className="proto-auth-form__submit">Continue</button>
      </form>
    </div>
  );
}

function InShellContent({ slug }: { slug: string }) {
  const data = { documents: [] as Array<{ name: string; pages: number; department: string; modified: string }>, devices: [] as Array<{ id: string; name: string; status: string }> };

  if (slug.includes("document") || slug.startsWith("section-04")) {
    return (
      <ShellPanel title="Documents" subtitle="Browse scanned files by department">
        <div className="proto-table-wrap">
          <table className="proto-table">
            <thead><tr><th>File</th><th>Pages</th><th>Department</th><th>Modified</th></tr></thead>
            <tbody>
              {data.documents.map((d) => (
                <tr key={d.name}><td>{d.name}</td><td>{d.pages}</td><td>{d.department}</td><td>{d.modified}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShellPanel>
    );
  }

  if (slug.includes("search") || slug.startsWith("section-05")) {
    return (
      <ShellPanel title="Search" subtitle="Find documents across your library">
        <input className="proto-search" placeholder="Search documents…" />
        <ul className="proto-list">
          {data.documents.slice(0, 5).map((d) => (
            <li key={d.name}>{d.name} · {d.department}</li>
          ))}
        </ul>
      </ShellPanel>
    );
  }

  if (slug.includes("devices") || slug.startsWith("section-06")) {
    return (
      <ShellPanel title="Devices" subtitle="Connected scanners and drivers">
        <div className="proto-cards">
          {data.devices.map((d) => (
            <article key={d.id} className="proto-card">
              <h3>{d.name}</h3>
              <p className={d.status === "connected" ? "proto-status--ok" : "proto-status--muted"}>
                {d.status === "connected" ? "Connected" : "Offline"}
              </p>
            </article>
          ))}
        </div>
      </ShellPanel>
    );
  }

  if (slug.includes("settings") || slug.startsWith("section-07")) {
    return (
      <ShellPanel title="Settings" subtitle="Application preferences and security">
        <div className="proto-settings">
          {["Scan defaults", "Storage location", "Notifications", "License & updates"].map((s) => (
            <button key={s} type="button" className="proto-settings__row">{s}<span>›</span></button>
          ))}
        </div>
      </ShellPanel>
    );
  }

  if (slug.includes("about") || slug.startsWith("section-08") || slug.includes("help-assistant")) {
    return (
      <ShellPanel title="About" subtitle="Desktop Scanner · Bukolabs.io">
        <p className="proto-body">Secure local scanning for assigned institutional workspaces.</p>
        <ul className="proto-list">
          <li>Version 1.0.0</li>
          <li>Offline-ready document library</li>
          <li>Enterprise serial key activation</li>
        </ul>
      </ShellPanel>
    );
  }

  if (slug.includes("print")) {
    return (
      <ShellPanel title="Print" subtitle="Print a saved document">
        <select className="proto-select"><option>Select printer</option></select>
        <button type="button" className="proto-btn">Print document</button>
      </ShellPanel>
    );
  }

  if (slug.includes("offline-dashboard")) {
    return (
      <ShellPanel title="Offline Dashboard" subtitle="Continue working without a network connection">
        <p className="proto-body">Recent scans and queued uploads are available offline.</p>
      </ShellPanel>
    );
  }

  if (slug.includes("scan") || slug.startsWith("section-03") || slug.startsWith("section-screen")) {
    const step = slug.includes("configure") ? "Configure scan" : slug.includes("preview") ? "Preview" : slug.includes("save") ? "Save document" : "Select scanner";
    return (
      <ShellPanel title="Scan" subtitle={step}>
        <div className="proto-scan">
          <div className="proto-scan__preview" />
          <div className="proto-scan__controls">
            <label>Resolution<select className="proto-select"><option>300 DPI</option></select></label>
            <label>Color mode<select className="proto-select"><option>Color</option></select></label>
            <button type="button" className="proto-btn">Start scan</button>
          </div>
        </div>
      </ShellPanel>
    );
  }

  const meta = getFigmaScreen(slug);
  return (
    <ShellPanel title={meta?.name ?? slug} subtitle="Prototype screen — coded layout matching Figma user flow">
      <p className="proto-body">This view is rendered in code for UI testing (no embedded design image).</p>
    </ShellPanel>
  );
}

export function PrototypeScreen({ slug, variant = "full", className = "", children }: Props) {
  const meta = getFigmaScreen(slug);
  const figmaId = meta?.figmaId;

  if (slug === "checking-credentials") {
    return <CheckingCredentialsScreen />;
  }
  if (slug === "validating-serial-key") {
    return <ValidatingSerialKeyScreen />;
  }
  if (slug === "checking-connection") {
    if (children) {
      return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-3 bg-[rgba(15,23,42,0.45)] p-5 backdrop-blur-[8px]">
          {children}
        </div>
      );
    }
    return <CheckingConnectionScreen />;
  }
  if (slug === "account-activated") {
    return <AccountActivatedScreen />;
  }
  if (slug === "no-internet-connection") {
    return (
      <NoInternetConnectionScreen
        onRetry={() => undefined}
        onContinueOffline={() => undefined}
      />
    );
  }
  if (slug === "forgot-password") {
    return <ForgotPasswordScreen />;
  }
  if (slug === "need-account-access") {
    return <NeedAccountAccessScreen />;
  }
  if (slug === "request-through-email") {
    return <RequestEmailScreen />;
  }
  if (slug === "request-through-sms") {
    return <RequestSmsScreen />;
  }
  if (slug === "request-sent-successfully") {
    return <RequestSentScreen context="activation" />;
  }
  if (slug === "request-sent-for-forgot-password-successfully") {
    return <RequestSentScreen context="forgot" />;
  }

  if (variant === "inShell") {
    return (
      <div className={`proto-shell ${className}`} data-screen={slug} data-figma-id={figmaId}>
        <InShellContent slug={slug} />
        {children}
      </div>
    );
  }

  return (
    <div className={`proto-full ${className}`} data-screen={slug} data-figma-id={figmaId}>
      <InShellContent slug={slug} />
      {children}
    </div>
  );
}
