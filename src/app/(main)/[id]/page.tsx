"use client";

import AnalysisContainer from "@/components/AnalysisContainer/AnalysisContainer";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import { FeatureNotAvailable } from "@/components/FeatureNotAvailable";
import { BusyIndicator } from "@ui5/webcomponents-react";

export default function AnalysisPage() {
  const { flag: isEnabled, loading } = useFeatureFlag(
    "FF_Chat_Analysis_Screen"
  );

  if (loading) {
    return <BusyIndicator active size="L" text="Loading analysis..." />;
  }

  if (!isEnabled) {
    return (
      <FeatureNotAvailable
        title="Feature Not Available"
        message="Chat analysis functionality is currently disabled."
      />
    );
  }

  return <AnalysisContainer />;
}
