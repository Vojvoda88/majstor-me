/** next/image `fill` needs explicit absolute sizing when `images.unoptimized` is enabled. */
export function fillCoverClass(extra?: string): string {
  const base = "absolute inset-0 h-full w-full object-cover";
  return extra ? `${base} ${extra}` : base;
}

export function fillContainClass(extra?: string): string {
  const base = "absolute inset-0 h-full w-full object-contain";
  return extra ? `${base} ${extra}` : base;
}
