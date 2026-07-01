import type { AdminSupportContact } from "../../hooks/useAdminSupportContact";

export function buildActivationEmailDescription(contact: AdminSupportContact | null) {
  if (contact?.email) {
    return `Ask your administrator at ${contact.email} to send your assigned username and serial key by email.`;
  }
  return "Ask your administrator to send your assigned username and serial key by email.";
}

export function buildActivationSmsDescription(contact: AdminSupportContact | null) {
  if (contact?.phoneNumber) {
    return `Ask your administrator at ${contact.phoneNumber} to send your access details through SMS.`;
  }
  return "Ask your administrator to send your assigned access details through SMS.";
}

export function buildForgotEmailDescription(contact: AdminSupportContact | null) {
  if (contact?.email) {
    return `Email your administrator at ${contact.email} for password assistance.`;
  }
  return "Send a request to your administrator for password assistance through email.";
}

export function buildForgotSmsDescription(contact: AdminSupportContact | null) {
  if (contact?.phoneNumber) {
    return `Send a message to your administrator at ${contact.phoneNumber}.`;
  }
  return "Send a message to your administrator using their registered contact number.";
}

export function buildPhysicalAdminDescription(contact: AdminSupportContact | null) {
  if (contact?.adminName) {
    return `Approach ${contact.adminName} directly for account verification and password reset assistance.`;
  }
  return "Approach your administrator directly for account verification and password reset assistance.";
}

export function buildActivationPhysicalDescription(contact: AdminSupportContact | null) {
  if (contact?.adminName) {
    return `Approach ${contact.adminName} directly to receive printed or written access details.`;
  }
  return "Approach your administrator directly to receive printed or written access details.";
}

export function appendAdminContactHint(
  base: string,
  contact: AdminSupportContact | null,
  channel: "email" | "sms",
) {
  if (channel === "email" && contact?.email) {
    return `${base} Contact ${contact.adminName?.trim() || "your administrator"} at ${contact.email}.`;
  }
  if (channel === "sms" && contact?.phoneNumber) {
    return `${base} Contact ${contact.adminName?.trim() || "your administrator"} at ${contact.phoneNumber}.`;
  }
  if (contact?.adminName?.trim()) {
    return `${base} Contact ${contact.adminName.trim()} for assistance.`;
  }
  return base;
}
