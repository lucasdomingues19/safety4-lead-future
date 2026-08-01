/**
 * Central coordinator so site-wide popups never compete with each other.
 * Only one popup may be shown per session, first-come first-served.
 */
const ACTIVE_KEY = "popup_active_owner";
const SHOWN_KEY = "popup_shown_owner";

export type PopupOwner = "governance_readiness" | "newsletter";

/** Try to reserve the popup slot for this session. Returns false if taken. */
export const claimPopupSlot = (owner: PopupOwner): boolean => {
  if (typeof window === "undefined") return false;
  const shown = sessionStorage.getItem(SHOWN_KEY);
  if (shown && shown !== owner) return false;
  if (shown === owner) return false;
  sessionStorage.setItem(SHOWN_KEY, owner);
  sessionStorage.setItem(ACTIVE_KEY, owner);
  return true;
};

export const releasePopupSlot = (owner: PopupOwner) => {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(ACTIVE_KEY) === owner) {
    sessionStorage.removeItem(ACTIVE_KEY);
  }
};

/** True when any popup has already been displayed this session. */
export const popupAlreadyShown = (): boolean =>
  typeof window !== "undefined" && !!sessionStorage.getItem(SHOWN_KEY);
