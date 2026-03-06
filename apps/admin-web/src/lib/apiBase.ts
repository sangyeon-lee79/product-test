function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

const DEFAULT_WORKERS_API = 'https://pet-life-api.adrien-lee.workers.dev';

export function getApiBase(): string {
  const envBase = import.meta.env.VITE_API_URL as string | undefined;
  if (envBase) return trimTrailingSlash(envBase);

  const { hostname, protocol } = window.location;

  // Google IDX/Cloud Workstations: 5173-xxx -> 8787-xxx
  if (hostname.includes('cluster.cloudworkstations.dev')) {
    const backendHostname = hostname.replace(/^5173-/, '8787-');
    return `${protocol}//${backendHostname}`;
  }

  // Local development default
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8787';
  }

  // Cloudflare Pages fallback: use deployed Workers API if env is missing.
  if (hostname.endsWith('.pages.dev')) {
    return DEFAULT_WORKERS_API;
  }

  // Non-local fallback: explicit default API endpoint.
  return DEFAULT_WORKERS_API;
}
