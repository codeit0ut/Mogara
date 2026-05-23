/** Called when an authenticated API request returns 401. */
let onSessionInvalid: (() => void) | null = null;

export function setSessionInvalidHandler(handler: (() => void) | null) {
  onSessionInvalid = handler;
}

export function notifySessionInvalid() {
  onSessionInvalid?.();
}
