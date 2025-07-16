import React, { useRef, useCallback } from "react";
import {
  FlexBox,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Text,
  Icon,
  InputDomRef,
} from "@ui5/webcomponents-react";

import { AnalysisRenaming } from "./AnalysisRenaming";
import { CreateAnalysis } from "./CreateAnalysis";
import { useSequentialNaming } from "@/hooks/useSequentialNaming";

interface AnalysisHeaderProps {
  onFiltersReset?: () => void;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ onFiltersReset }) => {
  const { currentName, generateNextName, setCustomName } =
    useSequentialNaming();
  const inputRef = useRef<InputDomRef>(null);

  const handleCreateAnalysis = useCallback(() => {
    generateNextName();
    onFiltersReset?.();
  }, [generateNextName, onFiltersReset]);

  return (
    <FlexBox
      justifyContent={FlexBoxJustifyContent.SpaceBetween}
      alignItems={FlexBoxAlignItems.Center}
      style={{ paddingInline: "0.5rem" }}
    >
      <FlexBox style={{ gap: "1.5rem" }}>
        <AnalysisRenaming
          analysisName={currentName}
          onNameChange={setCustomName}
          inputRef={inputRef}
        />

        <CreateAnalysis onCreateAnalysis={handleCreateAnalysis} />
      </FlexBox>

      <FlexBox
        alignItems={FlexBoxAlignItems.Center}
        style={{
          gap: "0.5rem",
          color: "var(--sapHighlightColor)",
        }}
      >
        <Text
          style={{
            fontSize: "var(--sapFontSize)",
            color: "var(--sapHighlightColor)",
            fontWeight: "400",
          }}
        >
          Analysis Auto-Saved
        </Text>
        <Icon
          name="accept"
          style={{
            fontSize: "1rem",
            color: "var(--sapHighlightColor)",
          }}
        />
      </FlexBox>
    </FlexBox>
  );
};

export default AnalysisHeader;
