/**
 * Time utilities.
 *
 * Expiry checks intentionally use `Date.now()`. React 19's purity rule flags
 * this during render, but every caller here is a Server Component that
 * renders once per request — temporal impurity doesn't cause unstable UI in
 * SSR. Localizing the eslint-disable here keeps it off consumer sites.
 */

export function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  return new Date(expiresAt).getTime() < Date.now();
}
