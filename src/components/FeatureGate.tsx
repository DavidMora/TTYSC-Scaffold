import React from "react";
import { FeatureFlagKey } from "@/lib/types/feature-flags";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";

interface FeatureGateProps {
  flag: FeatureFlagKey;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on a feature flag
 */
export function FeatureGate({ flag, fallback = null, children }: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

interface ConditionalFeatureProps {
  flag: FeatureFlagKey;
  enabled?: React.ReactNode;
  disabled?: React.ReactNode;
}

/**
 * Component that renders different content based on feature flag state
 */
export function ConditionalFeature({ flag, enabled = null, disabled = null }: ConditionalFeatureProps) {
  const isEnabled = useFeatureFlag(flag);
  
  return <>{isEnabled ? enabled : disabled}</>;
}
