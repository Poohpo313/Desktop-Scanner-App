function buildActivationQuery(params: { username?: string; serialKey?: string }) {
  const query = new URLSearchParams();
  if (params.username) query.set("username", params.username);
  if (params.serialKey) query.set("serialKey", params.serialKey);
  const suffix = query.toString();
  return suffix ? `?${suffix}` : "";
}

export function forgotPasswordCloseTarget(username?: string) {
  return username ? `/login?username=${encodeURIComponent(username)}` : "/login";
}

export function forgotPasswordBackTarget(username?: string) {
  return username ? `/forgot?username=${encodeURIComponent(username)}` : "/forgot";
}

export function forgotPasswordContinueTarget() {
  return "/login";
}

export function needAccountAccessCloseTarget(params: {
  username?: string;
  serialKey?: string;
}) {
  return `/activate${buildActivationQuery(params)}`;
}

export function needAccountAccessBackTarget(params: {
  username?: string;
  serialKey?: string;
}) {
  return `/need-account-access${buildActivationQuery(params)}`;
}

export function needAccountAccessContinueTarget() {
  return "/activate";
}

export function requestSupportCloseTarget(
  context: string,
  params: { username?: string; serialKey?: string },
) {
  if (context === "forgot") {
    return forgotPasswordBackTarget(params.username);
  }
  return needAccountAccessBackTarget(params);
}

export function requestSupportContinueTarget(context: string) {
  if (context === "forgot") {
    return forgotPasswordContinueTarget();
  }
  return needAccountAccessContinueTarget();
}
