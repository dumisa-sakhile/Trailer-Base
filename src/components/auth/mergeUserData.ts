export default function mergeUserData(existing: Record<string, any> | null, incoming: Record<string, any> | null) {
  if (!existing) return incoming ?? null;
  if (!incoming) return existing;
  // shallow merge: keep existing values when incoming is undefined, else take incoming
  const out: Record<string, any> = { ...existing };
  for (const key of Object.keys(incoming)) {
    const val = (incoming as any)[key];
    if (val === undefined) continue;
    // prefer incoming when provided; keep existing for undefined
    out[key] = val;
  }
  return out;
}