type ModalDescriptionProps = {
  children: React.ReactNode;
};

export function ModalDescription({ children }: ModalDescriptionProps) {
  return (
    <p className="m-0 max-w-[390px] text-center font-sans text-[15px] font-normal leading-[1.8] text-[#64748B]">
      {children}
    </p>
  );
}
