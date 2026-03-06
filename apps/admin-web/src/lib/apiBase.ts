function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getApiBase(): string {
  const envBase = import.meta.env.VITE_API_URL as string | undefined;
  if (envBase) return trimTrailingSlash(envBase);

  const { hostname, origin, protocol } = window.location;

  // Google IDX/Cloud Workstations: 5173-xxx -> 8787-xxx
  if (hostname.includes('cluster.cloudworkstations.dev')) {
    const backendHostname = hostname.replace(/^5173-/, '8787-');
    return `${protocol}//${backendHostname}`;
  }

  // Local development default
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8787';
  }

  // Non-local fallback: keep same origin so we don't call localhost in production.
  return origin;
}

