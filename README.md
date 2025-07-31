This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses a simple JSON-based feature flag system that allows you to enable/disable features without code changes.

### Setup Feature Flags

1. Run the setup script to create your feature flags file:
```bash
./scripts/setup-feature-flags.sh
```

2. Or manually copy the example file:
```bash
cp feature-flags.example.json feature-flags.json
```

3. Edit `feature-flags.json` to enable/disable features:
```json
{
  "enableAuthentication": true
}
```

### Available Feature Flags

- **enableAuthentication**: Controls whether authentication is required to access the app

### Using Feature Flags in Code

#### React Hooks
```tsx
import { useFeatureFlag, useAuthenticationEnabled } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const isAuthEnabled = useAuthenticationEnabled();
  
  return (
    <div>
      {isAuthEnabled && <LoginButton />}
    </div>
  );
}
```

#### Feature Gate Component
```tsx
import { FeatureGate } from '@/components/FeatureGate';

function App() {
  return (
    <FeatureGate flag="enableAuthentication" fallback={<div>Authentication disabled</div>}>
      <AuthenticatedContent />
    </FeatureGate>
  );
}
```

#### Server-side (API Routes, Server Components)
```tsx
import { isFeatureEnabled } from '@/lib/utils/feature-flags';

export async function GET() {
  if (isFeatureEnabled('enableAuthentication')) {
    // Check authentication logic
  }
  
  return Response.json({ data: 'response' });
}
```

### Notes

- The `feature-flags.json` file is git-ignored to allow different configurations per environment
- The system falls back to safe defaults if the file doesn't exist or is malformed
- Changes to feature flags require a server restart in production
- Feature flags are cached on the server for performance

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
