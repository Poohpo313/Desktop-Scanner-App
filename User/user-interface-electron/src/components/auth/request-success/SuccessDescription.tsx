type SuccessDescriptionProps = {
  children: React.ReactNode;
};

export function SuccessDescription({ children }: SuccessDescriptionProps) {
  return (
    <p className="m-0 max-w-[400px] px-1 text-center font-sans text-[15px] font-normal leading-[1.75] text-[#64748B]">
      {children}
    </p>
  );
}
