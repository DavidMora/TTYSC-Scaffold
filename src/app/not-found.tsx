"use client";

import {
  Page,
  Title,
  Text,
  Card,
  CardHeader,
  Button,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  MessageStrip,
  Icon,
} from "@ui5/webcomponents-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Page style={{ padding: "0rem" }}>
      <FlexBox
        direction={FlexBoxDirection.Column}
        justifyContent={FlexBoxJustifyContent.Center}
        alignItems={FlexBoxAlignItems.Center}
        style={{
          minHeight: "calc(100vh - 200px)",
          gap: "2rem",
          padding: "2rem",
        }}
      >
        {/* Error Icon */}
        <Icon
          name="error"
          style={{
            fontSize: "4rem",
            color: "var(--sapNegativeColor)",
          }}
        />

        {/* Main Error Message */}
        <FlexBox
          direction={FlexBoxDirection.Column}
          alignItems={FlexBoxAlignItems.Center}
          style={{ gap: "1rem", textAlign: "center" }}
        >
          <Title level="H1" style={{ fontSize: "3rem", margin: "0" }}>
            404
          </Title>
          <Title level="H2" style={{ margin: "0" }}>
            Page Not Found
          </Title>
          <Text style={{ maxWidth: "500px", textAlign: "center" }}>
            The page you are looking for doesn&apos;t exist or has been moved.
            Please check the URL or navigate back to continue using the
            application.
          </Text>
        </FlexBox>

        {/* Error Details Card */}
        <Card style={{ maxWidth: "37.5rem", width: "100%" }}>
          <CardHeader
            titleText="What can you do?"
            style={{ paddingBottom: "0.5rem" }}
          />
          <div style={{ padding: "1rem" }}>
            <MessageStrip design="Information" hideCloseButton>
              You can try the following options to get back on track:
            </MessageStrip>
            <FlexBox
              direction={FlexBoxDirection.Column}
              style={{ gap: "0.5rem", marginTop: "1rem" }}
            >
              <Text>• Check if the URL is spelled correctly</Text>
              <Text>• Go back to the previous page</Text>
              <Text>• Return to the home page</Text>
              <Text>
                • Use the navigation menu to find what you&apos;re looking for
              </Text>
            </FlexBox>
          </div>
        </Card>

        {/* Action Buttons */}
        <FlexBox style={{ gap: "1rem" }}>
          <Button design="Emphasized" onClick={handleGoHome} icon="home">
            Go to Home
          </Button>
          <Button design="Default" onClick={handleGoBack} icon="nav-back">
            Go Back
          </Button>
        </FlexBox>
      </FlexBox>
    </Page>
  );
}
