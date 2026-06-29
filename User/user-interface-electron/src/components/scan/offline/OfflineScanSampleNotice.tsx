import { AppErrorState } from "../../common/AppErrorState";

type OfflineScanSampleNoticeProps = {
  children: React.ReactNode;
};

export function OfflineScanSampleNotice({ children }: OfflineScanSampleNoticeProps) {
  const message = typeof children === "string" ? children : undefined;

  return (
    <AppErrorState
      variant="info"
      title="Note"
      message={message ?? "Review the details below before continuing."}
      compact
    />
  );
}
