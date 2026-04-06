export function readEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? undefined;
  }
  return undefined;
}
