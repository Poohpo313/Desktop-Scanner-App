import bukolabsLogo from "../logo/bukolabs-logo 1.png";

export default function BrandHeroHeader() {
  return (
    <header className="auth-hero__header">
      <div className="auth-hero__product-brand">
        <div className="auth-hero__brand-title">Desktop Scanner</div>
        <div className="auth-hero__brand-sub">Admin Management</div>
      </div>
      <div className="auth-hero__partner-brand">
        <img className="auth-hero__partner-logo" src={bukolabsLogo} alt="Bukolabs" />
        <div className="auth-hero__partner-text">
          <div className="auth-hero__partner-name">bukolabs.io</div>
          <div className="auth-hero__partner-tag">infinite possibilities</div>
        </div>
      </div>
    </header>
  );
}
