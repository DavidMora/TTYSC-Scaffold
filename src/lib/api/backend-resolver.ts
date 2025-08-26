import fs from 'node:fs';
import path from 'node:path';

const BACKEND_MAP_FILE = 'src/config/backend-map.json';

/** Types describing the backend mapping JSON structure */
export interface BackendAuthBasic {
  type: 'basic';
}
export interface BackendAuthBearerId {
  type: 'bearer-id-token';
}
export type BackendAuth = BackendAuthBasic | BackendAuthBearerId;

export interface BackendDefinition {
  baseURL: string;
  auth: BackendAuth;
}

export interface BackendRouteRule {
  pattern: string; // regex string
  backend: string; // key in backends map
}

export interface BackendMapFile {
  default: string; // default backend key
  backends: Record<string, BackendDefinition>;
  routes: BackendRouteRule[];
}

interface ResolvedBackend extends BackendDefinition {
  key: string;
}

let cache: { ts: number; data: BackendMapFile } | null = null;
const MAP_RELATIVE_PATH = BACKEND_MAP_FILE;
const DEV_TTL_MS = 5000;

function loadFile(): BackendMapFile {
  const filePath = path.join(process.cwd(), MAP_RELATIVE_PATH);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as BackendMapFile;
}

function getMap(): BackendMapFile {
  if (process.env.NODE_ENV === 'production') {
    cache ??= { ts: Date.now(), data: loadFile() };
    return cache.data;
  }
  if (!cache || Date.now() - cache.ts > DEV_TTL_MS) {
    try {
      cache = { ts: Date.now(), data: loadFile() };
    } catch (e) {
      if (cache) {
        return cache.data; // fallback to previous
      }
      throw e;
    }
  }
  return cache.data;
}

function applyEnvironmentOverrides(map: BackendMapFile): void {
  // Define environment variable mappings for backend URLs
  const envMappings = [
    { backendKey: 'mock', envVar: 'MOCK_BACKEND_BASE_URL' },
    { backendKey: 'real', envVar: 'BACKEND_BASE_URL' },
    { backendKey: 'feedback', envVar: 'FEEDBACK_BACKEND_BASE_URL' },
    { backendKey: 'userMetrics', envVar: 'USER_METRICS_BACKEND_BASE_URL' },
  ];

  // Apply environment overrides for base URLs
  for (const { backendKey, envVar } of envMappings) {
    const backend = map.backends[backendKey];
    const envValue = process.env[envVar];

    if (backend && envValue) {
      backend.baseURL = envValue;
    }
  }
}

export function resolveBackend(pathname: string): ResolvedBackend {
  const map = getMap();

  // Apply environment configuration overrides
  applyEnvironmentOverrides(map);

  // Find matching backend route
  const matchingRule = map.routes.find((rule) => {
    try {
      const regex = new RegExp(rule.pattern);
      return regex.test(pathname);
    } catch {
      return false; // ignore bad regex
    }
  });

  // Return matching backend if found
  if (matchingRule) {
    const def = map.backends[matchingRule.backend];
    if (def) {
      return { key: matchingRule.backend, ...def };
    }
  }

  // Fallback to default backend
  const def = map.backends[map.default];
  if (!def) {
    throw new Error('Default backend not defined in backend-map.json');
  }

  return { key: map.default, ...def };
}
