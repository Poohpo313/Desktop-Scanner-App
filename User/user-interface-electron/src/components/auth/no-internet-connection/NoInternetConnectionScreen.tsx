import { ContinueOfflineButton } from "./ContinueOfflineButton";
import { OfflineActions } from "./OfflineActions";
import { OfflineBackground } from "./OfflineBackground";
import { OfflineCard } from "./OfflineCard";
import { OfflineDescription } from "./OfflineDescription";
import { OfflineHeader } from "./OfflineHeader";
import { OfflineWarningIcon } from "./OfflineWarningIcon";
import { RetryButton } from "./RetryButton";

type NoInternetConnectionScreenProps = {
  onRetry: () => void;
  onContinueOffline: () => void;
};

export function NoInternetConnectionScreen({
  onRetry,
  onContinueOffline,
}: NoInternetConnectionScreenProps) {
  return (
    <OfflineBackground>
      <OfflineCard>
        <OfflineWarningIcon />
        <OfflineHeader />
        <OfflineDescription />
        <OfflineActions>
          <RetryButton onClick={onRetry} />
          <ContinueOfflineButton onClick={onContinueOffline} />
        </OfflineActions>
      </OfflineCard>
    </OfflineBackground>
  );
}
