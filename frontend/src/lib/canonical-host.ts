export const CANONICAL_HOST = 'buddysearch.online';
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

const ALIAS_HOSTS = new Set([
  'buddysearch.in',
  'www.buddysearch.in',
  'www.buddysearch.online',
]);

export function hostnameOf(hostHeader: string) {
  return String(hostHeader || '').split(':')[0].trim().toLowerCase();
}

/** 301 target when a request hits the old brand domain or www. */
export function canonicalRedirectLocation(hostHeader: string, urlPath: string) {
  const host = hostnameOf(hostHeader);
  if (!host || host === CANONICAL_HOST) return null;
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return null;
  if (!ALIAS_HOSTS.has(host)) return null;
  const path = urlPath && urlPath.startsWith('/') ? urlPath : `/${urlPath || ''}`;
  return `${CANONICAL_ORIGIN}${path === '//' ? '/' : path}`;
}

export function shouldSkipCanonicalRedirect(urlPath: string) {
  const path = String(urlPath || '');
  return (
    path.startsWith('/api') ||
    path.startsWith('/socket.io') ||
    path.startsWith('/health') ||
    path.startsWith('/uploads')
  );
}
