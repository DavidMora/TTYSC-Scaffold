import React, { useState, useCallback } from "react";
import {
  FlexBox,
  FlexBoxAlignItems,
  Text,
  Icon,
} from "@ui5/webcomponents-react";
import { ConfirmationModal } from "../Modal/ConfirmationModal";
interface CreateAnalysisProps {
  onCreateAnalysis: () => Promise<unknown>;
  isCreating: boolean;
}

export const CreateAnalysis: React.FC<CreateAnalysisProps> = ({
  onCreateAnalysis,
  isCreating,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleStartNew = useCallback(async () => {
    await onCreateAnalysis();
    setIsModalOpen(false);
  }, [onCreateAnalysis]);

  return (
    <>
      <FlexBox
        alignItems={FlexBoxAlignItems.Center}
        className="text-nowrap user-select-none"
        style={{
          gap: "0.5rem",
          cursor: "pointer",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.25rem",
          transition: "background-color 0.2s ease",
          backgroundColor: isHovered
            ? "var(--sapContent_Hover_Background)"
            : "transparent",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
        }}
        onClick={openModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon
          name="write-new-document"
          style={{
            color: "var(--sapContent_IconColor)",
            cursor: "pointer",
          }}
        />
        <Text
          style={{
            fontSize: "var(--sapFontSize)",
            color: "var(--sapContent_LabelColor)",
            fontWeight: "400",
            cursor: "pointer",
          }}
        >
          Create Analysis
        </Text>
      </FlexBox>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Start a new analysis?"
        message="Your current analysis will be saved."
        width="442px"
        actions={[
          {
            label: "Cancel",
            design: "Transparent",
            disabled: isCreating,
            onClick: closeModal,
          },
          {
            label: isCreating ? "Creating..." : "Start New",
            design: "Emphasized",
            disabled: isCreating,
            onClick: () => {
              handleStartNew();
            },
          },
        ]}
      />
    </>
  );
};
