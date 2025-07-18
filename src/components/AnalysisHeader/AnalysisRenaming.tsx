import React, { useState, useEffect } from "react";
import {
  FlexBox,
  FlexBoxAlignItems,
  Text,
  Icon,
  Input,
  InputDomRef,
} from "@ui5/webcomponents-react";
import { ConfirmationModal } from "../Modal/ConfirmationModal";
import { useRenameAnalysis } from "@/hooks/useAnalysis";

interface AnalysisRenamingProps {
  analysisName: string;
  analysisId?: string;
  onNameChange: (name: string) => void;
  inputRef: React.RefObject<InputDomRef | null>;
}

const MAX_NAME_LENGTH = 30;

export const AnalysisRenaming: React.FC<AnalysisRenamingProps> = ({
  analysisName,
  analysisId,
  onNameChange,
  inputRef,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);

  const { mutate: renameAnalysis, isLoading } = useRenameAnalysis({
    onSuccess: (data) => {
      onNameChange(data.name);
      setEditingValue("");
      setIsEditing(false);
    },
    onError: () => {
      setIsEditing(false);
    },
  });

  useEffect(() => {
    if (isEditing && !showValidationModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing, showValidationModal, inputRef]);

  const handleStartEditing = () => {
    setEditingValue(analysisName);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditingValue("");
  };

  const handleSaveEdit = async () => {
    const trimmedValue = editingValue.trim();

    if (!trimmedValue || trimmedValue.length > MAX_NAME_LENGTH) {
      setShowValidationModal(true);
      return;
    }
    if (analysisId) {
      await renameAnalysis({ id: analysisId, data: { name: trimmedValue } });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancelEditing();
    }
  };

  const handleInputChange = (event: { target: { value: string } }) => {
    setEditingValue(event.target.value);
  };

  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
  };

  return (
    <>
      <FlexBox
        alignItems={FlexBoxAlignItems.Center}
        style={{ gap: "0.5rem", height: "2rem" }}
      >
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editingValue}
            onKeyDown={handleKeyDown}
            onInput={handleInputChange}
            onBlur={handleSaveEdit}
            maxlength={MAX_NAME_LENGTH}
            disabled={isLoading}
            placeholder={isLoading ? "Saving..." : undefined}
            style={{
              width: `${Math.max(
                editingValue.length || analysisName.length,
                8
              )}ch`,
              minWidth: `120px`,
              transition: "width 0.2s ease",
              opacity: isLoading ? 0.7 : 1,
            }}
          />
        ) : (
          <>
            <Text
              style={{
                fontSize: "var(--sapFontHeader4Size)",
                fontWeight: "700",
                color: "var(--sapHighlightColor)",
              }}
            >
              {analysisName}
            </Text>
            <button
              onClick={handleStartEditing}
              aria-label="Edit analysis name"
              style={{
                background: "none",
                border: "none",
                padding: "0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon
                name="write-new"
                style={{
                  color: "var(--sapHighlightColor)",
                }}
              />
            </button>
          </>
        )}
      </FlexBox>

      <ConfirmationModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        title="Naming Analysis"
        message="Please provide information before leaving this field."
        description="Please fill in this field with the necessary information before proceeding."
        actions={[
          {
            label: "OK",
            design: "Emphasized",
            onClick: handleCloseValidationModal,
          },
        ]}
      />
    </>
  );
};
