import { beforeEach, describe, expect, it } from 'vitest';
import {
  ONBOARDING_MAX_DISMISSALS,
  getOnboardingDismissCount,
  onboardingRemainingShows,
  recordOnboardingDismiss,
  shouldShowOnboarding,
} from './onboardingStorage';

describe('onboardingStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows until max dismissals', () => {
    expect(shouldShowOnboarding()).toBe(true);
    for (let i = 0; i < ONBOARDING_MAX_DISMISSALS - 1; i++) {
      recordOnboardingDismiss();
      expect(shouldShowOnboarding()).toBe(true);
    }
    recordOnboardingDismiss();
    expect(shouldShowOnboarding()).toBe(false);
    expect(getOnboardingDismissCount()).toBe(ONBOARDING_MAX_DISMISSALS);
    expect(onboardingRemainingShows()).toBe(0);
  });
});
