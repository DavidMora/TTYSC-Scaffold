"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FlexBox,
  FlexBoxDirection,
  Title,
  Text,
  Icon,
} from "@ui5/webcomponents-react";
import { useCreateAnalysis } from "@/hooks/useAnalysis";

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

export default function Home() {
  const router = useRouter();

  const createAnalysisMutation = useCreateAnalysis({
    onSuccess: (newAnalysis) => {
      router.push(`/${newAnalysis.id}`);
    },
    onError: (error) => {
      console.error("Failed to create analysis:", error);
    },
  });

  useEffect(() => {
    if (!createAnalysisMutation.isLoading && !createAnalysisMutation.data) {
      createAnalysisMutation.mutate?.();
    }
  }, [createAnalysisMutation]);

  return <LoadingDisplay />;
}
