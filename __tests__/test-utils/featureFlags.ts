import type { FeatureFlags } from "@/lib/types/feature-flags";
import { DEFAULT_FLAGS } from "@/lib/utils/feature-flags";

// Shared fallback/default flags for tests to avoid duplication
export const FALLBACK_FLAGS: FeatureFlags = DEFAULT_FLAGS;
