import { X } from "lucide-react";
import { createPortal } from "react-dom";
import type { ReleaseNote, ThirdPartyLicense } from "./aboutContent";

type AboutInfoModalProps =
  | {
      kind: "release-notes";
      title: string;
      releaseNotes: ReleaseNote[];
      onClose: () => void;
    }
  | {
      kind: "licenses";
      title: string;
      licenses: ThirdPartyLicense[];
      onClose: () => void;
    };

export function AboutInfoModal(props: AboutInfoModalProps) {
  const { title, onClose } = props;

  return createPortal(
    <div className="about-info-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="about-info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-info-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="about-info-modal__header">
          <h2 id="about-info-modal-title" className="about-info-modal__title">
            {title}
          </h2>
          <button type="button" className="about-info-modal__close" aria-label="Close" onClick={onClose}>
            <X strokeWidth={2} />
          </button>
        </header>

        <div className="about-info-modal__body">
          {props.kind === "release-notes" ? (
            <div className="about-info-modal__release-list">
              {props.releaseNotes.map((entry) => (
                <section key={entry.version} className="about-info-modal__release">
                  <h3>
                    Version {entry.version}
                    <span>{entry.date}</span>
                  </h3>
                  <ul>
                    {entry.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <>
              <p className="about-info-modal__intro">
                Desktop Scanner includes the following open-source software. Each component is used
                under its respective license.
              </p>
              <ul className="about-info-modal__license-list">
                {props.licenses.map((entry) => (
                  <li key={entry.name}>
                    <strong>{entry.name}</strong>
                    <span>{entry.license}</span>
                    {entry.notice ? <p>{entry.notice}</p> : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
