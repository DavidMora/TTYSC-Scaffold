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

interface AnalysisRenamingProps {
  analysisName: string;
  onNameChange: (name: string) => void;
  inputRef: React.RefObject<InputDomRef | null>;
}

const MAX_NAME_LENGTH = 30;

export const AnalysisRenaming: React.FC<AnalysisRenamingProps> = ({
  analysisName,
  onNameChange,
  inputRef,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);

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

  const handleSaveEdit = () => {
    const trimmedValue = editingValue.trim();

    if (!trimmedValue || trimmedValue.length > MAX_NAME_LENGTH) {
      setShowValidationModal(true);
      return;
    }

    onNameChange(trimmedValue);
    setIsEditing(false);
    setEditingValue("");
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
            style={{
              width: `${Math.max(
                editingValue.length || analysisName.length,
                8
              )}ch`,
              minWidth: `120px`,
              transition: "width 0.2s ease",
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
            <Icon
              onClick={handleStartEditing}
              name="write-new"
              role="button"
              tabIndex={0}
              aria-label="Edit analysis name"
              style={{
                color: "var(--sapHighlightColor)",
                cursor: "pointer",
              }}
            />
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
