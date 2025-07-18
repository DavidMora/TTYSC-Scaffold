"use client";

import {
  FlexBox,
  FlexBoxDirection,
  BusyIndicator,
  Text,
  Title,
  Button,
} from "@ui5/webcomponents-react";
import { useState } from "react";
import SideBarMenu from "@/components/AppLayout/SideBar";
import { sideBarItems } from "@/lib/constants/UI/SideBarItems";
import HeaderBar from "@/components/AppLayout/HeaderBar";
import { HEADER_BAR_CONFIG } from "@/lib/constants/UI/HeaderBar";
import AnalysisFilter from "@/components/AnalysisFilters/AnalysisFilters";
import { useAnalysisFilters } from "@/hooks/useAnalysisFilters";
import AnalysisHeader from "../AnalysisHeader/AnalysisHeader";
import { useAnalysis } from "@/hooks/useAnalysis";

interface AppLayoutProps {
  children: React.ReactNode;
}

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

export default function AppLayout({ children }: Readonly<AppLayoutProps>) {
  const [sideNavCollapsed] = useState(false);

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
    mutate: refetchAnalysis,
  } = useAnalysis("1");

  return (
    <FlexBox
      direction={FlexBoxDirection.Column}
      style={{ height: "100vh", width: "100vw" }}
    >
      <FlexBox style={{ flex: 1, overflow: "hidden" }}>
        {/* Side Navigation */}
        <div
          style={{
            minWidth: "auto",
            transition: "min-width 0.3s ease",
            borderRight: "1px solid var(--sapGroup_TitleBorderColor)",
            backgroundColor: "var(--sapGroup_ContentBackground)",
          }}
        >
          <SideBarMenu
            sideNavCollapsed={sideNavCollapsed}
            navItems={sideBarItems}
          />
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "1rem",
            overflow: "auto",
            backgroundColor: "var(--sapGroup_ContentBackground)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <HeaderBar {...HEADER_BAR_CONFIG.supplyChain} />
          <hr
            style={{
              height: "2px",
              backgroundColor: "var(--sapToolbar_SeparatorColor)",
            }}
          />
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
          {isLoading ? (
            <LoadingDisplay />
          ) : (
            <>
              {error ? (
                <ErrorDisplay error={error} onRetry={refetchAnalysis} />
              ) : (
                <>
                  <AnalysisHeader
                    onFiltersReset={resetFilters}
                    currentAnalysisId={analysis?.id}
                    currentAnalysisName={analysis?.name}
                  />

                  {children}
                </>
              )}
            </>
          )}
        </div>
      </FlexBox>
    </FlexBox>
  );
}
