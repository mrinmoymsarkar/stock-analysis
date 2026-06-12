/**
 * Sanitizes a `?next=` redirect target so post-login redirects can only land
 * on a same-origin path — never an external site (open-redirect protection).
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return '/';
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return '/';
  }
  return next;
}
