import { useParams } from "react-router-dom";
import { FlowNav } from "../components/FlowNav";
import { screenRegistry } from "../screens/registry";

export default function FigmaScreenPage() {
  const { slug } = useParams<{ slug: string }>();
  const Screen = slug ? screenRegistry[slug] : null;

  if (Screen) {
    return (
      <div className="min-h-screen pb-28">
        <Screen />
        <FlowNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      <iframe
        title={slug}
        src={`/screens/${slug}.html`}
        className="h-[calc(100vh-7rem)] w-full border-0"
      />
      <FlowNav />
    </div>
  );
}
