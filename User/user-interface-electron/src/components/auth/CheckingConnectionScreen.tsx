import { CheckingConnectionModal, ConnectionBackdrop } from "./checking-connection";
import "../../styles/auth-modals.css";

export function CheckingConnectionScreen() {
  return (
    <ConnectionBackdrop>
      <CheckingConnectionModal />
    </ConnectionBackdrop>
  );
}
