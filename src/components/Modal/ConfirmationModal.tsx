import React from "react";
import {
  FlexBox,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Text,
  Icon,
  Dialog,
  Button,
  Title,
} from "@ui5/webcomponents-react";

interface ModalAction {
  label: string;
  design?: "Emphasized" | "Transparent" | "Default";
  onClick: () => void;
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
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      style={{ width }}
      header={
        <Title level="H3" style={{ marginBlock: "0.5rem", width: "100%" }}>
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
          {actions.map((action, index) => (
            <Button
              key={index}
              design={action.design || "Default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </FlexBox>
      }
    >
      <FlexBox
        alignItems={FlexBoxAlignItems.Center}
        style={{
          gap: "0.5rem",
          marginTop: "1rem",
          marginBottom: "1rem",
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
    </Dialog>
  );
};
