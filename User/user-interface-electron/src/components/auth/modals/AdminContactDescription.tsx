import { Fragment } from "react";
import { ModalDescription } from "./ModalDescription";

type AdminContactDescriptionProps = {
  text: string;
  highlight?: string | null;
};

export function AdminContactDescription({ text, highlight }: AdminContactDescriptionProps) {
  const contact = highlight?.trim();
  if (!contact || !text.includes(contact)) {
    return <ModalDescription>{text}</ModalDescription>;
  }

  const parts = text.split(contact);

  return (
    <ModalDescription>
      {parts.map((part, index) => (
        <Fragment key={`${index}-${part.slice(0, 12)}`}>
          {part}
          {index < parts.length - 1 ? (
            <strong className="font-semibold text-[#008768]">{contact}</strong>
          ) : null}
        </Fragment>
      ))}
    </ModalDescription>
  );
}
