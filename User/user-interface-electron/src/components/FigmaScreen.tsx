import "../styles/figma-screen.css";

export type FigmaScreenProps = {
  fileSlug: string;
  figmaId?: string;
  name: string;
  asset: string;
  className?: string;
};

export function FigmaScreen({ fileSlug, figmaId, name, asset, className = "" }: FigmaScreenProps) {
  return (
    <main className={`figma-screen ${className}`} data-screen={fileSlug} data-figma-id={figmaId}>
      <div className="figma-screen__viewport">
        <img className="figma-screen__img" src={asset} alt={name} />
      </div>
    </main>
  );
}
