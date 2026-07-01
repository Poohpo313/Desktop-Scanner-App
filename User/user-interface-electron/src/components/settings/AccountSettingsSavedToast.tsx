import { DocumentSaveSuccessToast } from "../scan/offline/DocumentSaveSuccessToast";

type Props = {
  onClose: () => void;
};

export function AccountSettingsSavedToast({ onClose }: Props) {
  return (
    <DocumentSaveSuccessToast
      onClose={onClose}
      label="ACCOUNT SETTINGS"
      title="Account settings changed successfully"
      description="Your email, phone number, and password updates have been saved."
    />
  );
}
