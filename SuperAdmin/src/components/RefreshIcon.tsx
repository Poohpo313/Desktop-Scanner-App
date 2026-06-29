type Props = {
  spinning?: boolean;
};

export default function RefreshIcon({ spinning = false }: Props) {
  return (
    <img
      className={spinning ? "refresh-icon refresh-icon--spinning" : "refresh-icon"}
      src="/assets/Refresh.svg"
      alt=""
      aria-hidden="true"
      width={18}
      height={16}
    />
  );
}
