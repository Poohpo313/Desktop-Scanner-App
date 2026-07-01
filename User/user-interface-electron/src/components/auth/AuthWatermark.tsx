export function AuthWatermark() {
  return (
    <div className="auth-watermark" aria-hidden="true">
      <div className="auth-watermark__oval auth-watermark__oval--outer" />
      <div className="auth-watermark__oval auth-watermark__oval--inner" />
      <svg
        className="auth-watermark__mark"
        viewBox="0 0 42 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.08 4.58C21 0.8 29.4 8.36 34.86 12.98L25.2 18.86C20.16 15.08 15.12 13.82 10.5 19.28L10.08 4.58Z"
          fill="rgba(0, 122, 94, 0.07)"
        />
        <path
          d="M25.2 18.86C18.9 23.9 13.02 28.1 9.24 35.24C13.86 37.76 18.9 37.76 23.94 34.4C28.14 31.46 30.66 27.26 33.6 23.48L25.2 18.86Z"
          fill="rgba(0, 167, 165, 0.05)"
        />
        <path
          d="M9.24 35.24C15.12 44.9 25.2 49.1 32.76 41.12L25.62 34.4C21 39.02 15.12 39.44 9.24 35.24Z"
          fill="rgba(0, 135, 104, 0.06)"
        />
      </svg>
    </div>
  );
}
