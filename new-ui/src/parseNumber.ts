/** Parse integer form input; keep previous value when empty or invalid. */
export function boundedIntFromInput(
  raw: string,
  fallback: number,
  min?: number,
  max?: number,
): number {
  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  if (min !== undefined && parsed < min) {
    return min;
  }
  if (max !== undefined && parsed > max) {
    return max;
  }
  return parsed;
}
