import { Link } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import manifest from "../screens-manifest.json";
import flow from "../flow.json";

export default function FigmaGalleryPage() {
  const flowNodes = new Set(Object.keys(flow.nodes));

  return (
    <main className="min-h-screen bg-brand-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <BrandLogo />
            <h1 className="text-2xl font-semibold text-gray-900 mt-6">Figma Prototype Gallery</h1>
            <p className="mt-2 text-sm text-gray-500">
              {manifest.length} screens · Flow entry:{" "}
              <Link className="text-brand-emerald font-medium hover:underline" to={`/figma/${flow.entry}`}>
                Launch flow
              </Link>
            </p>
          </div>
          <Link to="/" className="btn-outline-emerald text-sm py-2">
            Open production app
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {manifest.map((screen) => (
            <Link
              key={screen.id}
              to={`/figma/${screen.fileSlug}`}
              className="card-surface p-4 hover:border-brand-emerald transition group"
            >
              <p className="font-medium text-gray-900 group-hover:text-brand-emerald transition">
                {screen.name}
              </p>
              <p className="mt-1 text-xs text-gray-400">{screen.id}</p>
              {flowNodes.has(screen.fileSlug) && (
                <span className="mt-2 inline-block rounded-full bg-brand-mint px-2.5 py-0.5 text-xs font-medium text-brand-primary">
                  In flow
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
