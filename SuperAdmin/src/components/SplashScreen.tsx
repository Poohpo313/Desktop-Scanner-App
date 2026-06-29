type Props = {
  logoSrc: string;
  logoAlt: string;
  title: string;
  subtitle: string;
  status: string;
  accessNote: string;
};

export default function SplashScreen({
  logoSrc,
  logoAlt,
  title,
  subtitle,
  status,
  accessNote,
}: Props) {
  return (
    <main className="splash">
      <div className="splash__shape splash__shape--left" aria-hidden="true" />
      <div className="splash__shape splash__shape--right" aria-hidden="true" />
      <section className="splash__panel">
        <div className="splash__logo-frame">
          <img className="splash__logo" src={logoSrc} alt={logoAlt} />
        </div>
        <h1 className="splash__title">{title}</h1>
        <p className="splash__subtitle">{subtitle}</p>
        <div className="splash__progress" aria-hidden="true">
          <div className="splash__progress-fill" />
        </div>
        <p className="splash__status">{status}</p>
      </section>
      <p className="splash__access-note">{accessNote}</p>
    </main>
  );
}
