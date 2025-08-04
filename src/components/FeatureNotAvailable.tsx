import {
  FlexBox,
  FlexBoxDirection,
  Title,
  Text,
  Icon,
} from "@ui5/webcomponents-react";

interface FeatureNotAvailableProps {
  title?: string;
  message?: string;
}

export function FeatureNotAvailable({
  title = "Feature Not Available",
  message = "This functionality is currently disabled.",
}: Readonly<FeatureNotAvailableProps>) {
  return (
    <FlexBox
      direction={FlexBoxDirection.Column}
      style={{
        padding: "3rem",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "1.5rem",
        minHeight: "400px",
      }}
    >
      <Icon
        name="message-information"
        style={{
          fontSize: "4rem",
          color: "var(--sapNeutralTextColor)",
          opacity: 0.6,
        }}
      />
      <Title level="H2" style={{ color: "var(--sapNeutralTextColor)" }}>
        {title}
      </Title>
      <Text
        style={{
          maxWidth: "500px",
          color: "var(--sapNeutralTextColor)",
          fontSize: "1.1rem",
          lineHeight: "1.5",
        }}
      >
        {message}
      </Text>
    </FlexBox>
  );
}
