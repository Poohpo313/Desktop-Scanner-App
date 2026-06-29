type SuccessStatusBadgeProps = {
  children: React.ReactNode;
};

export function SuccessStatusBadge({ children }: SuccessStatusBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgba(0,135,104,0.12)] bg-[rgba(0,135,104,0.06)] px-3.5 py-2.5 font-sans text-[13px] font-medium text-[#0B5F58]">
      {children}
    </span>
  );
}
