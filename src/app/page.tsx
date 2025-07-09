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

export default function Home() {
  const router = useRouter();

  const handleNavigateToAbout = () => {
    router.push("/about");
  };

  return (
    <Page style={{ padding: "0rem" }}>
      <FlexBox direction={FlexBoxDirection.Column} style={{ gap: "1rem" }}>
        {/* Header Section */}
        <FlexBox
          direction={FlexBoxDirection.Column}
          alignItems={FlexBoxAlignItems.Center}
          style={{ padding: "2rem 0" }}
        >
          <Title level="H1" style={{ marginBottom: "1rem" }}>
            Welcome to SAPUI5 Next.js
          </Title>
          <Text style={{ textAlign: "center", maxWidth: "600px" }}>
            This is a modern web application built with Next.js and SAPUI5 React
            components. Experience the power of enterprise-grade UI components
            with the flexibility of React.
          </Text>
          <div
            style={{
              marginTop: "1rem",
              backgroundColor: "var(--sapSuccessColor)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
            }}
          >
            Powered by SAPUI5
          </div>
        </FlexBox>

        {/* Success Message */}
        <MessageStrip design="Positive">
          <Icon name="accept" slot="icon" />
          Your SAPUI5 Next.js application is successfully configured!
        </MessageStrip>

        {/* Feature Cards */}
        <FlexBox
          direction={FlexBoxDirection.Row}
          justifyContent={FlexBoxJustifyContent.SpaceAround}
          style={{ gap: "1rem", flexWrap: "wrap" }}
        >
          <Card style={{ minWidth: "300px", flex: 1 }}>
            <CardHeader
              titleText="Enterprise Components"
              subtitleText="Professional UI"
            />
            <div style={{ padding: "1rem" }}>
              <Text>
                Use enterprise-grade SAPUI5 components that follow SAP Fiori
                design guidelines for consistent and professional user
                interfaces.
              </Text>
              <FlexBox style={{ marginTop: "1rem" }}>
                <Button design="Emphasized">Explore Components</Button>
              </FlexBox>
            </div>
          </Card>

          <Card style={{ minWidth: "300px", flex: 1 }}>
            <CardHeader
              titleText="Next.js Integration"
              subtitleText="Modern Framework"
            />
            <div style={{ padding: "1rem" }}>
              <Text>
                Leverage the power of Next.js with server-side rendering,
                routing, and optimization features combined with SAPUI5
                components.
              </Text>
              <FlexBox style={{ marginTop: "1rem" }}>
                <Button design="Default">Learn More</Button>
              </FlexBox>
            </div>
          </Card>

          <Card style={{ minWidth: "300px", flex: 1 }}>
            <CardHeader
              titleText="Responsive Design"
              subtitleText="Mobile Ready"
            />
            <div style={{ padding: "1rem" }}>
              <Text>
                Built-in responsive design ensures your application works
                perfectly across all devices and screen sizes.
              </Text>
              <FlexBox style={{ marginTop: "1rem" }}>
                <Button design="Default">View Demo</Button>
              </FlexBox>
            </div>
          </Card>
        </FlexBox>

        {/* Navigation Section */}
        <FlexBox
          justifyContent={FlexBoxJustifyContent.Center}
          style={{ marginTop: "2rem", marginBottom: "2rem" }}
        >
          <Button
            design="Emphasized"
            onClick={handleNavigateToAbout}
            icon="navigation-right-arrow"
          >
            Learn About This Project
          </Button>
        </FlexBox>
      </FlexBox>
    </Page>
  );
}
