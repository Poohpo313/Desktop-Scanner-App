import { getHighlightTerms, splitHighlightedText } from "./searchHelpers";

type Props = {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
};

export function HighlightedText({
  text,
  query,
  className,
  highlightClassName = "search-result-card__highlight",
}: Props) {
  const segments = splitHighlightedText(text, query);

  if (segments.length === 1 && !segments[0]?.highlight) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.highlight ? (
          <mark key={index} className={highlightClassName}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
}

export function hasHighlightableTerms(query: string): boolean {
  return getHighlightTerms(query).length > 0;
}
