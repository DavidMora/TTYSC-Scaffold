"use client";

import AnalysisChat from "@/components/AnalysisChat/AnalysisChat";
import AnalysisFilter from "@/components/AnalysisFilters/AnalysisFilters";
import AnalysisHeader from "@/components/AnalysisHeader/AnalysisHeader";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useAnalysisFilters } from "@/hooks/useAnalysisFilters";
import { useSequentialNaming } from "@/contexts/SequentialNamingContext";
import {
  BusyIndicator,
  Button,
  FlexBox,
  FlexBoxDirection,
  Text,
  Title,
} from "@ui5/webcomponents-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const ErrorDisplay = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) => (
  <FlexBox
    direction={FlexBoxDirection.Column}
    style={{
      padding: "2rem",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: "1rem",
      backgroundColor: "var(--sapGroup_ContentBackground)",
    }}
  >
    <Title level="H3" style={{ color: "var(--sapNeutralTextColor)" }}>
      Unable to Load Analysis
    </Title>

    <Text style={{ maxWidth: "400px", color: "var(--sapNeutralTextColor)" }}>
      {error.message ||
        "Something went wrong while fetching the analysis data. Please try again."}
    </Text>

    {onRetry && (
      <Button design="Emphasized" onClick={onRetry}>
        Try Again
      </Button>
    )}
  </FlexBox>
);

const LoadingDisplay = () => (
  <FlexBox
    style={{
      padding: "2rem",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <BusyIndicator active size="L" text="Loading analysis..." />
  </FlexBox>
);

export default function AnalysisContainer() {
  const params = useParams();
  const analysisId = params.id as string;
  const [analysisName, setAnalysisName] = useState<string>("");

  const {
    filters,
    availableOptions,
    isDisabled,
    handleFilterChange,
    resetFilters,
  } = useAnalysisFilters();

  const {
    data: analysis,
    error,
    isLoading,
    isValidating,
    mutate: refetchAnalysis,
  } = useAnalysis(analysisId);

  const { generateAnalysisName } = useSequentialNaming();

  useEffect(() => {
    if (analysis?.data) {
      if (analysis?.data?.name !== "") {
        setAnalysisName(analysis?.data?.name);
      } else if (analysisName === "") {
        setAnalysisName(generateAnalysisName());
      }
    }
  }, [analysis?.data, generateAnalysisName, analysisName]);

  return (
    <>
      <AnalysisFilter
        filters={filters}
        availableOptions={availableOptions}
        isDisabled={isDisabled}
        handleFilterChange={handleFilterChange}
      />
      <hr
        style={{
          height: "2px",
          backgroundColor: "var(--sapToolbar_SeparatorColor)",
        }}
      />
      {isLoading || isValidating ? (
        <LoadingDisplay />
      ) : (
        <>
          {error ? (
            <ErrorDisplay error={error} onRetry={refetchAnalysis} />
          ) : (
            <>
              <AnalysisHeader
                onFiltersReset={resetFilters}
                currentAnalysisId={analysis?.data?.id}
                currentAnalysisName={analysisName}
                showAutoSaved={true}
              />
              <AnalysisChat />
            </>
          )}
        </>
      )}
    </>
  );
}
