export function getTVScale(
  isTVOS: boolean,
  width: number,
  height: number,
): number {
  if (!isTVOS || width <= 0 || height <= 0) return 1;
  return Math.min(width / 960, height / 540);
}
