import { ReactNode } from "react";
import { BukolabsBrand } from "../brand/BukolabsBrand";
import { getFigmaScreen } from "../../figma/figmaScreenCatalog";
import { icons, type IconName } from "../../icons";
import "../../styles/login.css";

type Benefit = {
  icon: IconName;
  title: string;
  text: string;
};

const DEFAULT_BENEFITS: Benefit[] = [
  {
    icon: "shield",
    title: "Secure Access",
    text: "Only authorized users can access your assigned account.",
  },
  {
    icon: "lockLarge",
    title: "Local & Safe",
    text: "Your documents stay on your device and remain under your control.",
  },
  {
    icon: "wifi",
    title: "Online / Offline Ready",
    text: "Work seamlessly whether you're online or offline.",
  },
];

type Props = {
  children: ReactNode;
  cardIcon?: IconName;
  cardTitle: string;
  cardSubtitle: string;
  /** Matches public/screens/{slug}.html */
  screenSlug: string;
  /** Figma 1.2 — 54px deep-teal activate heading */
  titleVariant?: "default" | "activate";
};

export function AuthSplitLayout({
  children,
  cardIcon = "userLarge",
  cardTitle,
  cardSubtitle,
  screenSlug,
  titleVariant = "default",
}: Props) {
  const figmaId = getFigmaScreen(screenSlug)?.figmaId;

  return (
    <div className="login" data-screen={screenSlug} data-figma-id={figmaId}>
      <aside className="login__aside">
        <div className="login__aside-shape" aria-hidden="true" />
        <BukolabsBrand variant="auth" className="login__brand" />
        <p className="login__kicker">Welcome to</p>
        <h1 className="login__title">Desktop Scanner</h1>
        <p className="login__desc">Secure access to your scanning workspace.</p>
        <div className="login__benefits">
          {DEFAULT_BENEFITS.map((item) => (
            <article key={item.title} className="login__benefit">
              <div className="login__benefit-icon">
                <img src={icons[item.icon]} alt="" />
              </div>
              <div>
                <h2 className="login__benefit-title">{item.title}</h2>
                <p className="login__benefit-text">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </aside>

      <section className="login__main">
        <div className="login__card">
          <header className="login__card-header">
            <div className="login__card-icon">
              <img src={icons[cardIcon]} alt="" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h2
                className={
                  titleVariant === "activate"
                    ? "login__card-title login__card-title--activate"
                    : "login__card-title"
                }
              >
                {cardTitle}
              </h2>
              <p className="login__card-subtitle">{cardSubtitle}</p>
            </div>
          </header>
          {children}
        </div>
      </section>

      <footer className="login__footer">
        <div className="login__footer-item">
          <img src={icons.shield} alt="" className="w-5 h-5" /> Admin-controlled access
        </div>
        <div className="login__footer-item">
          <img src={icons.lock} alt="" className="w-5 h-5" /> Safe local scanning
        </div>
        <div className="login__footer-item">
          <img src={icons.wifi} alt="" className="w-5 h-5" /> Online/Offline ready
        </div>
      </footer>
    </div>
  );
}
