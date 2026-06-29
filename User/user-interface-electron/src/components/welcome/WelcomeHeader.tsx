import { BukolabsBrand } from "../brand/BukolabsBrand";

export function WelcomeHeader() {
  return (
    <header className="welcome-header">
      <BukolabsBrand variant="welcome" />

      <div className="welcome-header__intro">
        <p className="welcome-header__kicker">Welcome to</p>
        <h1 className="welcome-header__title">Desktop Scanner</h1>
        <p className="welcome-header__subtitle">
          Securely scan, organize, and manage documents with ease.
        </p>
      </div>
    </header>
  );
}
