export function getEllipsisDirection(
  pageNumbers: Array<number | "ellipsis">,
  index: number
): "forward" | "backward" {
  const prev = pageNumbers[index - 1];
  if (typeof prev === "number" && prev <= 3) return "forward";
  return "backward";
}

export function getPaginationJumpTarget(
  current: number,
  total: number,
  direction: "forward" | "backward"
): number {
  if (direction === "forward") {
    if (current <= 3) return Math.min(4, total);
    return Math.min(total, current + 2);
  }

  if (current >= total - 2) return Math.max(1, total - 3);
  return Math.max(1, current - 2);
}

export function renderPaginationEllipsis(
  key: string,
  direction: "forward" | "backward",
  onJump: (direction: "forward" | "backward") => void,
  className: string
) {
  return (
    <button
      key={key}
      type="button"
      className={`${className} ${className}--interactive`}
      onClick={() => onJump(direction)}
      aria-label={direction === "forward" ? "Show later pages" : "Show earlier pages"}
    >
      ...
    </button>
  );
}
