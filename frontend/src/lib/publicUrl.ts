/**
 * Browser traffic must stay on the page origin (port 3000). The Next rewrite
 * proxies /api and /socket.io to Express. Pointing the client at localhost:4000
 * hangs in Cursor/cloud previews because that port is not the page the user opened.
 */
const LOCAL_BACKEND = 'http://127.0.0.1:4000';

const stripApiSuffix = (url: string) => url.replace(/\/api\/?$/, '');

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return stripApiSuffix(process.env.NEXT_PUBLIC_API_URL || LOCAL_BACKEND);
  }
  return '';
}

export function getSocketUrl(): string {
  if (typeof window === 'undefined') {
    const fromEnv = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (fromEnv && !/localhost|127\.0\.0\.1/.test(fromEnv)) return fromEnv;
    return LOCAL_BACKEND;
  }
  return window.location.origin;
}
