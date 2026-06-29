export function forgotPasswordCloseTarget(username?: string) {
  return username ? `/forgot?username=${encodeURIComponent(username)}` : "/forgot";
}

export function forgotPasswordContinueTarget() {
  return "/login";
}

export function needAccountAccessCloseTarget(params: {
  username?: string;
  serialKey?: string;
}) {
  const query = new URLSearchParams();
  if (params.username) query.set("username", params.username);
  if (params.serialKey) query.set("serialKey", params.serialKey);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return `/need-account-access${suffix}`;
}

export function needAccountAccessContinueTarget() {
  return "/activate";
}

export function requestSupportCloseTarget(
  context: string,
  params: { username?: string; serialKey?: string },
) {
  if (context === "forgot") {
    return forgotPasswordCloseTarget(params.username);
  }
  return needAccountAccessCloseTarget(params);
}

export function requestSupportContinueTarget(context: string) {
  if (context === "forgot") {
    return forgotPasswordContinueTarget();
  }
  return needAccountAccessContinueTarget();
}
