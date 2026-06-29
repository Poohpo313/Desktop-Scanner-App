type Props = {
  section: string;
  onGoOnline?: () => void;
  onContinueOffline?: () => void;
};

export function NoInternetState({ section, onGoOnline, onContinueOffline }: Props) {
  return (
    <div className="card-surface p-10 text-center max-w-lg mx-auto">
      <p className="text-5xl mb-4 opacity-40" aria-hidden="true">
        📶
      </p>
      <h2 className="text-lg font-semibold text-gray-900">Oops! No Internet</h2>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
        The {section} section requires an internet connection to load cloud data. You can still
        work with locally stored documents.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {onGoOnline && (
          <button type="button" className="btn-primary text-sm py-2" onClick={onGoOnline}>
            Go Online
          </button>
        )}
        {onContinueOffline && (
          <button type="button" className="btn-outline text-sm py-2" onClick={onContinueOffline}>
            Continue Offline
          </button>
        )}
      </div>
    </div>
  );
}
