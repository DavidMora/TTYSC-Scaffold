import React from "react";
import {
  FlexBox,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Text,
  Icon,
  Button,
  Title,
  FlexBoxDirection,
} from "@ui5/webcomponents-react";
import FeatureFlaggedDialog from "@/components/Modals/FeatureFlaggedDialog";

interface ModalAction {
  label: string;
  design?: "Emphasized" | "Transparent" | "Default";
  onClick: () => void;
  disabled?: boolean;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  iconName?: string;
  iconColor?: string;
  width?: string;
  actions: ModalAction[];
  description?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  iconName = "alert",
  iconColor = "var(--sapCriticalElementColor)",
  width = "400px",
  actions,
  description,
}) => {
  return (
    <FeatureFlaggedDialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
      style={{ width }}
      header={
        <Title
          id="modal-title"
          level="H3"
          style={{ marginBlock: "0.5rem", width: "100%" }}
        >
          {title}
        </Title>
      }
      footer={
        <FlexBox
          justifyContent={FlexBoxJustifyContent.End}
          style={{
            gap: "1rem",
            marginTop: "0.5rem",
            width: "100%",
          }}
        >
          {actions?.length === 0 && (
            <Button design="Emphasized" onClick={onClose}>
              Close
            </Button>
          )}
          {actions.map((action, index) => (
            <Button
              key={`${action.label}-${index}`}
              design={action.design || "Default"}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </FlexBox>
      }
    >
      <FlexBox
        direction={FlexBoxDirection.Column}
        style={{
          gap: "1rem",
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
          paddingInlineEnd: "1rem",
        }}
      >
        <FlexBox
          alignItems={FlexBoxAlignItems.Center}
          style={{
            gap: "0.5rem",
          }}
        >
          <Icon
            name={iconName}
            style={{
              fontSize: "1rem",
              color: iconColor,
            }}
          />
          <Text
            style={{
              color: "var(--sapContent_LabelColor)",
              fontSize: "var(--sapFontSize)",
            }}
          >
            {message}
          </Text>
        </FlexBox>
        {description && (
          <Text
            style={{
              color: "var(--sapContent_LabelColor)",
              fontSize: "var(--sapFontSize)",
              paddingInlineStart: "1.5rem",
            }}
          >
            {description}
          </Text>
        )}
      </FlexBox>
    </FeatureFlaggedDialog>
  );
};
