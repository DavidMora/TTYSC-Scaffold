"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FlexBox,
  FlexBoxDirection,
  Title,
  Text,
  Icon,
  Button,
} from "@ui5/webcomponents-react";
import { useCreateChat } from "@/hooks/chats";

const LoadingDisplay = () => (
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
      name="business-objects-experience"
      style={{
        fontSize: "4rem",
        color: "var(--sapNeutralTextColor)",
        opacity: 0.6,
      }}
    />

    <Title level="H2" style={{ color: "var(--sapNeutralTextColor)" }}>
      Creating Your Analysis...
    </Title>

    <Text
      style={{
        maxWidth: "500px",
        color: "var(--sapNeutralTextColor)",
        fontSize: "1.1rem",
        lineHeight: "1.5",
      }}
    >
      Setting up your analysis dashboard. You&apos;ll be redirected
      automatically.
    </Text>
  </FlexBox>
);

const ErrorDisplay = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => (
  <FlexBox
    direction={FlexBoxDirection.Column}
    style={{
      padding: "1.5rem",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: "0.5rem",
      minHeight: "200px",
    }}
  >
    <Title
      level="H3"
      style={{ color: "var(--sapNeutralTextColor)", margin: 0 }}
    >
      Something went wrong
    </Title>

    <Text
      style={{
        maxWidth: "400px",
        color: "var(--sapNeutralTextColor)",
        fontSize: "0.9rem",
        lineHeight: "1.3",
        margin: 0,
      }}
    >
      {error.message}
    </Text>

    <Button
      onClick={onRetry}
      style={{
        marginTop: "0.25rem",
      }}
      design="Emphasized"
    >
      Try again
    </Button>
  </FlexBox>
);

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  const createAnalysisMutation = useCreateChat({
    onSuccess: (newAnalysis) => {
      router.push(`/${newAnalysis.id}`);
    },
    onError: (error) => {
      console.error("Failed to create analysis:", error);
      setError(error);
    },
  });

  const handleRetry = () => {
    setError(null);
    createAnalysisMutation.mutate?.();
  };

  useEffect(() => {
    createAnalysisMutation.mutate?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return error ? (
    <ErrorDisplay error={error} onRetry={handleRetry} />
  ) : (
    <LoadingDisplay />
  );
}
