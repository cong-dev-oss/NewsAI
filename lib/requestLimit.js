export const clampApiLimit = (value, { min = 1, max = 200, fallback = 50 } = {}) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const rounded = Math.trunc(numeric);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
};
