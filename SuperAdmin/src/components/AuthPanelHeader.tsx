type Props = {
  iconSrc: string;
  iconAlt?: string;
  iconFrameClassName: string;
  title: string;
  subtitle: string;
  titleClassName: string;
  subtitleClassName: string;
  contentClassName?: string;
};

export default function AuthPanelHeader({
  iconSrc,
  iconAlt = "",
  iconFrameClassName,
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
  contentClassName,
}: Props) {
  const content = (
    <>
      <div className={iconFrameClassName}>
        <img src={iconSrc} alt={iconAlt} aria-hidden={!iconAlt} />
      </div>
      <h1 className={titleClassName}>{title}</h1>
      <p className={subtitleClassName}>{subtitle}</p>
    </>
  );

  if (contentClassName) {
    return <div className={contentClassName}>{content}</div>;
  }

  return content;
}
