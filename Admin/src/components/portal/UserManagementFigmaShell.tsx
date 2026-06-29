import { useState } from "react";
import AdminPortalPage from "./AdminPortalPage";
import UserManagementBody from "./UserManagementBody";
import UserRegistrationScreenBody from "./UserRegistrationScreenBody";
import PortalOverlay from "./PortalOverlay";
import RegisterUserModal from "./RegisterUserModal";
import EditUserModal, { parseNameParts, type EditUserProfileDefaults } from "./EditUserModal";
import DeleteUserProfileModal from "./DeleteUserProfileModal";
import DeactivationRequestSubmittedModal from "./DeactivationRequestSubmittedModal";
import type { AdminUser } from "../../types";
import type { UserRegistrationRow } from "../../data/demoUserRegistration";
import "../../styles/portal-modal.css";
import "../../styles/delete-user-profile-modal.css";
import "../../styles/deactivation-request-submitted-modal.css";

type Crumb = { label: string; to?: string };

type Props = {
  figmaId: string;
  screen: string;
  breadcrumb?: Crumb[];
  layout?: "default" | "registration";
};

function registrationRowToAdminUser(row: UserRegistrationRow): AdminUser {
  const { firstName, lastName } = parseNameParts(row.name);
  return {
    userId: row.id,
    username: row.username,
    firstName,
    lastName,
    email: "",
    phoneNumber: "",
    accountStatus: row.status,
    serialKey: row.serialKey,
    createdAt: `${row.registeredDate}T09:00:00.000Z`,
  };
}

export default function UserManagementFigmaShell({
  figmaId,
  screen,
  breadcrumb = [{ label: "Dashboard" }, { label: "User Registration" }],
  layout = "default",
}: Props) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<EditUserProfileDefaults | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<UserRegistrationRow | null>(null);

  return (
    <AdminPortalPage
      figmaId={figmaId}
      screen={screen}
      breadcrumb={breadcrumb}
      showHeaderUtilities={layout !== "registration"}
    >
      {layout === "registration" ? (
        <UserRegistrationScreenBody
          onRegister={() => setRegisterOpen(true)}
          onEdit={(row) => {
            const nameParts = parseNameParts(row.name);
            setSelectedUser(registrationRowToAdminUser(row));
            setSelectedProfile({
              middleInitial: nameParts.middleInitial,
              department: row.department,
              company: row.organization,
            });
            setEditOpen(true);
          }}
          onDeactivate={(row) => {
            setDeactivateTarget(row);
            setDeactivateOpen(true);
          }}
        />
      ) : (
        <UserManagementBody
          variant="figma"
          onRegister={() => setRegisterOpen(true)}
          onEdit={(user) => {
            setSelectedUser(user);
            setSelectedProfile(null);
            setEditOpen(true);
          }}
        />
      )}

      <PortalOverlay open={registerOpen} onClose={() => setRegisterOpen(false)}>
        <RegisterUserModal onClose={() => setRegisterOpen(false)} onDone={() => setRegisterOpen(false)} />
      </PortalOverlay>

      <PortalOverlay open={editOpen} onClose={() => setEditOpen(false)}>
        <EditUserModal
          key={selectedUser?.userId ?? "demo"}
          user={selectedUser}
          profile={selectedProfile ?? undefined}
          onClose={() => setEditOpen(false)}
          onSubmit={() => setEditOpen(false)}
        />
      </PortalOverlay>

      <PortalOverlay
        open={deactivateOpen}
        onClose={() => {
          setDeactivateOpen(false);
          setDeactivateTarget(null);
        }}
      >
        {deactivateTarget ? (
          <DeleteUserProfileModal
            user={deactivateTarget}
            onCancel={() => {
              setDeactivateOpen(false);
              setDeactivateTarget(null);
            }}
            onSubmit={() => {
              setDeactivateOpen(false);
              setDeactivateSuccessOpen(true);
            }}
          />
        ) : null}
      </PortalOverlay>

      <PortalOverlay
        open={deactivateSuccessOpen}
        onClose={() => {
          setDeactivateSuccessOpen(false);
          setDeactivateTarget(null);
        }}
      >
        <DeactivationRequestSubmittedModal
          onDone={() => {
            setDeactivateSuccessOpen(false);
            setDeactivateTarget(null);
          }}
        />
      </PortalOverlay>
    </AdminPortalPage>
  );
}
