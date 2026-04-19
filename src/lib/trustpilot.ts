const SUCCESS_COUNT_KEY = "logic-vault:success-count";
const TRUSTPILOT_COMPLETED_KEY = "logic-vault:trustpilot-completed";

function isBrowser() {
  return typeof window !== "undefined";
}

export function recordSuccessfulToolRun() {
  if (!isBrowser()) {
    return {
      visitCount: 0,
      shouldPrompt: false,
    };
  }

  const nextCount = Number(window.localStorage.getItem(SUCCESS_COUNT_KEY) ?? "0") + 1;
  const hasCompletedTrustpilot =
    window.localStorage.getItem(TRUSTPILOT_COMPLETED_KEY) === "true";

  window.localStorage.setItem(SUCCESS_COUNT_KEY, String(nextCount));

  return {
    visitCount: nextCount,
    shouldPrompt: !hasCompletedTrustpilot && (nextCount === 1 || nextCount === 10),
  };
}

export function markTrustpilotCompleted() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(TRUSTPILOT_COMPLETED_KEY, "true");
}

export function hasCompletedTrustpilot() {
  if (!isBrowser()) {
    return false;
  }

  return window.localStorage.getItem(TRUSTPILOT_COMPLETED_KEY) === "true";
}
