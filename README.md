# TALK TO SUPPLY CHAIN FRONTEND (Next.js)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Feature Flags

This project implements a robust feature flag system with multiple configuration sources and priority-based loading.

### Configuration Priority

1. **Generated File** (`feature-flags.json`) - Highest priority for local development
2. **Environment Variables** - Used in production and as fallback
3. **Defaults** - Built-in safe fallback values

### Local Development Setup

1. Create your feature flags file from the template:

```bash
cp feature-flags.example.json feature-flags.json
```

2. Edit `feature-flags.json` to customize features:

```json
{
  "enableAuthentication": true
}
```

### Production Configuration

For production deployments, use environment variables:

```bash
# Environment variable format: FEATURE_FLAG_<FLAG_NAME> (preferred)
export FEATURE_FLAG_ENABLE_AUTHENTICATION=true

# Legacy naming is also supported as fallback
export ENABLE_AUTHENTICATION=true
```

#### Environment Variable Priority

The system reads environment variables in the following priority order:

1. **FEATURE*FLAG*\* (preferred)** - New naming convention
2. **Legacy naming** - Backward compatible naming
3. **Defaults** - Built-in safe fallback values

For example:

- `FEATURE_FLAG_ENABLE_AUTHENTICATION` (preferred) → `ENABLE_AUTHENTICATION` (legacy) → `true` (default)

### Available Feature Flags

| Flag Name                 | Description                          | Default Value | Environment Variables (Preferred → Legacy)                         |
| ------------------------- | ------------------------------------ | ------------- | ------------------------------------------------------------------ |
| `enableAuthentication`    | Enable/disable authentication system | `true`        | `FEATURE_FLAG_ENABLE_AUTHENTICATION` → `ENABLE_AUTHENTICATION`     |
| `FF_Chat_Analysis_Screen` | Enable chat analysis screen feature  | `true`        | `FEATURE_FLAG_FF_CHAT_ANALYSIS_SCREEN` → `FF_CHAT_ANALYSIS_SCREEN` |
| `FF_Full_Page_Navigation` | Enable full page navigation          | `true`        | `FEATURE_FLAG_FF_FULL_PAGE_NAVIGATION` → `FF_FULL_PAGE_NAVIGATION` |
| `FF_Side_NavBar`          | Enable side navigation bar           | `true`        | `FEATURE_FLAG_FF_SIDE_NAVBAR` → `FF_SIDE_NAVBAR`                   |
| `FF_Modals`               | Enable modal dialogs                 | `true`        | `FEATURE_FLAG_FF_MODALS` → `FF_MODALS`                             |
| `FF_Raw_Data_Navigation`  | Enable raw data navigation           | `false`       | `FEATURE_FLAG_RAW_DATA_NAVIGATION`                                 |

### Usage in Code

#### React Components & Hooks

```tsx
import {
  useFeatureFlag,
  useAuthenticationEnabled,
} from '@/hooks/useFeatureFlags';

function MyComponent() {
  const isAuthEnabled = useAuthenticationEnabled();

  return <div>{isAuthEnabled && <LoginButton />}</div>;
}
```

#### Feature Gate Components

```tsx
import { FeatureGate, ConditionalFeature } from '@/components/FeatureGate';

function App() {
  return (
    <FeatureGate
      flag="enableAuthentication"
      fallback={<div>Authentication disabled</div>}
    >
      <AuthenticatedContent />
    </FeatureGate>
  );
}

// Alternative conditional rendering
function Header() {
  return (
    <ConditionalFeature
      flag="enableAuthentication"
      enabled={<UserMenu />}
      disabled={<GuestMenu />}
    />
  );
}
```

#### Server-side Usage

```tsx
// Regular server components and API routes
import { isFeatureEnabled, getFeatureFlags } from '@/lib/utils/feature-flags';

export async function GET() {
  if (await isFeatureEnabled('enableAuthentication')) {
    // Check authentication logic
  }

  return Response.json({ data: 'response' });
}

// For edge runtime (middleware)
import { isFeatureEnabledEdge } from '@/lib/utils/feature-flags-edge';

export function middleware(request: NextRequest) {
  if (isFeatureEnabledEdge('enableAuthentication')) {
    // Handle authentication
  }
}
```

#### Synchronous Usage

```tsx
import {
  isFeatureEnabledSync,
  getFeatureFlagsSync,
} from '@/lib/utils/feature-flags';

// When you need synchronous access
function ComponentWithSync() {
  const isEnabled = isFeatureEnabledSync('enableAuthentication');
  // ...
}
```

### API Endpoints

The system provides REST API endpoints for dynamic access:

- `GET /api/feature-flags` - Get current feature flags (cached)
- `POST /api/feature-flags/reload` - Clear cache and reload flags

### Key Features

- **Caching**: Flags are cached for performance, avoiding repeated file reads
- **Fallback Strategy**: Graceful degradation through multiple configuration sources
- **TypeScript Support**: Full type safety with `FeatureFlags` interface and `FeatureFlagKey` type
- **Edge Runtime Compatible**: Separate utilities for middleware and edge contexts
- **Hot Reload**: Cache clearing API for dynamic updates
- **Error Handling**: Robust error handling with console warnings and safe defaults

### Adding New Feature Flags

1. Update the `FeatureFlags` interface in `src/lib/types/feature-flags.ts`:

```tsx
export interface FeatureFlags {
  enableAuthentication: boolean;
  enableNewFeature: boolean; // Add new flag
}
```

2. Add default value in `src/lib/utils/feature-flags.ts`:

```tsx
export const DEFAULT_FLAGS: FeatureFlags = {
  enableAuthentication: true,
  enableNewFeature: false, // Add default
};
```

3. Update your local `feature-flags.json` and environment variables as needed.

### Troubleshooting

- Check browser console for feature flag loading errors
- Verify environment variables are set correctly in your deployment platform
- Ensure `feature-flags.json` exists for local development
- Use `POST /api/feature-flags/reload` to clear cache if flags seem stale

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
