import fs from 'node:fs';
import path from 'node:path';

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
const MAP_RELATIVE_PATH = 'src/config/backend-map.json';
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

export function resolveBackend(pathname: string): ResolvedBackend {
  const map = getMap();
  for (const rule of map.routes) {
    try {
      const regex = new RegExp(rule.pattern);
      if (regex.test(pathname)) {
        const def = map.backends[rule.backend];
        if (def) return { key: rule.backend, ...def };
      }
    } catch {
      // ignore bad regex
    }
  }
  const def = map.backends[map.default];
  if (!def) {
    throw new Error('Default backend not defined in backend-map.json');
  }
  return { key: map.default, ...def };
}
