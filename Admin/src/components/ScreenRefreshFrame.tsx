import type { ReactNode } from "react";
import AnimatedPanel from "./AnimatedPanel";

type Props = {
  refreshToken: number;
  children: ReactNode;
  className?: string;
};

export default function ScreenRefreshFrame({ refreshToken, children, className }: Props) {
  return (
    <AnimatedPanel
      transitionKey={`screen-${refreshToken}`}
      className={`page-transition--route${className ? ` ${className}` : ""}`}
    >
      <div key={refreshToken}>{children}</div>
    </AnimatedPanel>
  );
}
