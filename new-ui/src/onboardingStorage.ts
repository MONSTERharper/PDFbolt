/** Show getting-started banner until the user dismisses it this many times. */
export const ONBOARDING_MAX_DISMISSALS = 6;

const STORAGE_KEY = 'pdfbolt-onboarding-v2';
const LEGACY_KEY = 'pdfbolt-onboarding-v1';

export function getOnboardingDismissCount(): number {
  try {
    if (localStorage.getItem(LEGACY_KEY) === '1') {
      return ONBOARDING_MAX_DISMISSALS;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return 0;
    }
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? Math.min(n, ONBOARDING_MAX_DISMISSALS) : 0;
  } catch {
    return 0;
  }
}

export function shouldShowOnboarding(): boolean {
  return getOnboardingDismissCount() < ONBOARDING_MAX_DISMISSALS;
}

/** Returns the new dismiss count after this dismissal. */
export function recordOnboardingDismiss(): number {
  const next = Math.min(getOnboardingDismissCount() + 1, ONBOARDING_MAX_DISMISSALS);
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
  return next;
}

export function onboardingRemainingShows(): number {
  return Math.max(0, ONBOARDING_MAX_DISMISSALS - getOnboardingDismissCount());
}
