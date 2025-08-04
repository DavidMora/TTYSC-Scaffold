import React from "react";
import { FeatureFlagKey } from "@/lib/types/feature-flags";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";

interface FeatureGateProps {
  readonly flag: FeatureFlagKey;
  readonly fallback?: React.ReactNode;
  readonly loadingFallback?: React.ReactNode;
  readonly children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on a feature flag
 */
export function FeatureGate({
  flag,
  fallback = null,
  children,
  loadingFallback = null,
}: FeatureGateProps) {
  const { flag: isEnabled, loading } = useFeatureFlag(flag);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (isEnabled) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface ConditionalFeatureProps {
  readonly flag: FeatureFlagKey;
  readonly enabled?: React.ReactNode;
  readonly disabled?: React.ReactNode;
}

/**
 * Component that renders different content based on feature flag state
 */
export function ConditionalFeature({
  flag,
  enabled = null,
  disabled = null,
}: ConditionalFeatureProps) {
  const { flag: isEnabled } = useFeatureFlag(flag);

  return <>{isEnabled ? enabled : disabled}</>;
}
