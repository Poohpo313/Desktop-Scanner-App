type SuccessHeaderProps = {
  children: React.ReactNode;
};

export function SuccessHeader({ children }: SuccessHeaderProps) {
  return (
    <h1 className="m-0 mb-4 mt-6 max-w-[320px] text-center font-sans text-[36px] font-semibold leading-[1.12] tracking-[-0.5px] text-[#0F172A] sm:text-[40px]">
      {children}
    </h1>
  );
}
