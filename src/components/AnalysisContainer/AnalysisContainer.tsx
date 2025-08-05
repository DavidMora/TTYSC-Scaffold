"use client";

import AnalysisChat from "@/components/AnalysisChat/AnalysisChat";
import AnalysisFilter from "@/components/AnalysisFilters/AnalysisFilters";
import AnalysisHeader from "@/components/AnalysisHeader/AnalysisHeader";
import { useAnalysisFilters } from "@/hooks/useAnalysisFilters";
import {
  BusyIndicator,
  Button,
  FlexBox,
  FlexBoxDirection,
  Text,
  Title,
} from "@ui5/webcomponents-react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useChat, useUpdateChat } from "@/hooks/chats";
import { useAutosaveUI } from "@/contexts/AutosaveUIProvider";
import { useAutoSave } from "@/hooks/useAutoSave";
import { INITIAL_FILTERS } from "@/lib/constants/UI/analysisFilters";

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
    data: analysis,
    error,
    isLoading,
    isValidating,
    mutate: refetchAnalysis,
  } = useChat(analysisId);

  const { filters, availableOptions, isDisabled, handleFilterChange } =
    useAnalysisFilters(
      { ...INITIAL_FILTERS, ...analysis?.data?.metadata },
      () => {
        hasUserModifiedRef.current = true;
      }
    );

  const { activateAutosaveUI, showAutoSaved } = useAutosaveUI();

  const { mutate: updateChat } = useUpdateChat({});

  const hasUserModifiedRef = useRef(false);

  useAutoSave({
    valueToWatch: hasUserModifiedRef.current ? filters : undefined,
    onSave: () => void updateChat({
      id: analysisId,
      metadata: {
        analysis: filters.analysis,
        organizations: filters.organizations,
        CM: filters.CM,
        SKU: filters.SKU,
        NVPN: filters.NVPN,
      },
    }),
    delayMs: 3000,
    onSuccess: () => {
      activateAutosaveUI();
    },
    onError: () => {
      console.error("Autosave failed");
    },
  });

  useEffect(() => {
    if (analysis?.data?.title) {
      setAnalysisName(analysis.data.title);
    }
  }, [analysis?.data]);

  return (
    <>
      {isLoading || isValidating ? (
        <LoadingDisplay />
      ) : (
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
          {error ? (
            <ErrorDisplay error={error} onRetry={refetchAnalysis} />
          ) : (
            <>
              <AnalysisHeader
                currentAnalysisId={analysis?.data?.id}
                currentAnalysisName={analysisName}
                showAutoSaved={showAutoSaved}
              />
              <AnalysisChat
                chatId={analysis?.data?.id || ""}
                previousMessages={analysis?.data?.messages || []}
                draft={analysis?.data?.draft || ""}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
