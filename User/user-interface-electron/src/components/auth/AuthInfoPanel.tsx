import { BukolabsBrand } from "../brand/BukolabsBrand";
import { icons, type IconName } from "../../icons";

export type AuthBenefit = {
  icon: IconName;
  title: string;
  text: string;
};

type Props = {
  benefits: AuthBenefit[];
};

export function AuthInfoPanel({ benefits }: Props) {
  return (
    <aside className="auth-info">
      <BukolabsBrand variant="auth" className="auth-info__brand" />

      <div className="auth-info__welcome">
        <p className="auth-info__kicker">Welcome to</p>
        <h1 className="auth-info__title">Desktop Scanner</h1>
        <p className="auth-info__desc">Secure access to your scanning workspace.</p>
      </div>

      <div className="auth-info__benefits">
        {benefits.map((item) => (
          <article key={item.title} className="auth-info__benefit">
            <div className="auth-info__benefit-icon">
              <img src={icons[item.icon]} alt="" />
            </div>
            <div>
              <h2 className="auth-info__benefit-title">{item.title}</h2>
              <p className="auth-info__benefit-text">{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
