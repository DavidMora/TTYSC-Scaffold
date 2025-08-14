'use client';

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
  Panel,
  Icon,
  Link,
} from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';

export default function About() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <Page>
      <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '1.5rem' }}>
        {/* Header */}
        <FlexBox
          direction={FlexBoxDirection.Column}
          alignItems={FlexBoxAlignItems.Center}
          style={{ padding: '2rem 0' }}
        >
          <Title level="H1" style={{ marginBottom: '1rem' }}>
            About This Project
          </Title>
          <Text style={{ textAlign: 'center', maxWidth: '800px' }}>
            Learn more about this Next.js application integrated with SAPUI5
            React components, including the technologies used, features
            implemented, and how to extend it further.
          </Text>
        </FlexBox>

        {/* Technology Stack */}
        <Card>
          <CardHeader
            titleText="Technology Stack"
            subtitleText="Modern technologies powering this application"
          />
          <div style={{ padding: '1rem' }}>
            <FlexBox
              direction={FlexBoxDirection.Column}
              style={{ gap: '1rem' }}
            >
              <FlexBox
                alignItems={FlexBoxAlignItems.Center}
                style={{ gap: '0.5rem' }}
              >
                <Icon name="developer-settings" />
                <div>
                  <Text style={{ fontWeight: 'bold' }}>Next.js 15</Text>
                  <Text
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--sapNeutralTextColor)',
                    }}
                  >
                    React-based framework for production-ready applications
                  </Text>
                </div>
              </FlexBox>

              <FlexBox
                alignItems={FlexBoxAlignItems.Center}
                style={{ gap: '0.5rem' }}
              >
                <Icon name="ui-notifications" />
                <div>
                  <Text style={{ fontWeight: 'bold' }}>
                    SAPUI5 React Components
                  </Text>
                  <Text
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--sapNeutralTextColor)',
                    }}
                  >
                    Enterprise-grade UI components following SAP Fiori design
                  </Text>
                </div>
              </FlexBox>

              <FlexBox
                alignItems={FlexBoxAlignItems.Center}
                style={{ gap: '0.5rem' }}
              >
                <Icon name="technical-object" />
                <div>
                  <Text style={{ fontWeight: 'bold' }}>TypeScript</Text>
                  <Text
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--sapNeutralTextColor)',
                    }}
                  >
                    Type-safe development with static type checking
                  </Text>
                </div>
              </FlexBox>

              <FlexBox
                alignItems={FlexBoxAlignItems.Center}
                style={{ gap: '0.5rem' }}
              >
                <Icon name="palette" />
                <div>
                  <Text style={{ fontWeight: 'bold' }}>Tailwind CSS</Text>
                  <Text
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--sapNeutralTextColor)',
                    }}
                  >
                    Utility-first CSS framework for rapid UI development
                  </Text>
                </div>
              </FlexBox>

              <FlexBox
                alignItems={FlexBoxAlignItems.Center}
                style={{ gap: '0.5rem' }}
              >
                <Icon name="database" />
                <div>
                  <Text style={{ fontWeight: 'bold' }}>Yarn</Text>
                  <Text
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--sapNeutralTextColor)',
                    }}
                  >
                    Package manager with efficient dependency resolution
                  </Text>
                </div>
              </FlexBox>
            </FlexBox>
          </div>
        </Card>

        {/* Features */}
        <FlexBox
          direction={FlexBoxDirection.Row}
          style={{ gap: '1rem', flexWrap: 'wrap' }}
        >
          <Card style={{ flex: 1, minWidth: '300px' }}>
            <CardHeader
              titleText="Key Features"
              subtitleText="What's included in this setup"
            />
            <div style={{ padding: '1rem' }}>
              <Panel headerText="Application Features" collapsed={false}>
                <FlexBox
                  direction={FlexBoxDirection.Column}
                  style={{ gap: '0.75rem', padding: '1rem' }}
                >
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    style={{ gap: '0.5rem' }}
                  >
                    <Icon name="accept" />
                    <Text>Responsive SAPUI5 Layout</Text>
                  </FlexBox>
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    style={{ gap: '0.5rem' }}
                  >
                    <Icon name="accept" />
                    <Text>Side Navigation with Routing</Text>
                  </FlexBox>
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    style={{ gap: '0.5rem' }}
                  >
                    <Icon name="accept" />
                    <Text>Theme Integration (SAP Horizon)</Text>
                  </FlexBox>
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    style={{ gap: '0.5rem' }}
                  >
                    <Icon name="accept" />
                    <Text>TypeScript Configuration</Text>
                  </FlexBox>
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    style={{ gap: '0.5rem' }}
                  >
                    <Icon name="accept" />
                    <Text>Jest Testing Setup</Text>
                  </FlexBox>
                </FlexBox>
              </Panel>
            </div>
          </Card>

          <Card style={{ flex: 1, minWidth: '300px' }}>
            <CardHeader
              titleText="Getting Started"
              subtitleText="Next steps for development"
            />
            <div style={{ padding: '1rem' }}>
              <Text style={{ marginBottom: '1rem' }}>
                To continue developing your application:
              </Text>
              <FlexBox
                direction={FlexBoxDirection.Column}
                style={{ gap: '0.75rem' }}
              >
                <FlexBox
                  alignItems={FlexBoxAlignItems.Center}
                  style={{ gap: '0.5rem' }}
                >
                  <Icon name="media-play" />
                  <div>
                    <Text style={{ fontWeight: 'bold' }}>Run yarn dev</Text>
                    <Text
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--sapNeutralTextColor)',
                      }}
                    >
                      Start the development server
                    </Text>
                  </div>
                </FlexBox>

                <FlexBox
                  alignItems={FlexBoxAlignItems.Center}
                  style={{ gap: '0.5rem' }}
                >
                  <Icon name="add-document" />
                  <div>
                    <Text style={{ fontWeight: 'bold' }}>Create Pages</Text>
                    <Text
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--sapNeutralTextColor)',
                      }}
                    >
                      Add new pages in src/app/
                    </Text>
                  </div>
                </FlexBox>

                <FlexBox
                  alignItems={FlexBoxAlignItems.Center}
                  style={{ gap: '0.5rem' }}
                >
                  <Icon name="puzzle" />
                  <div>
                    <Text style={{ fontWeight: 'bold' }}>Build Components</Text>
                    <Text
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--sapNeutralTextColor)',
                      }}
                    >
                      Customize components in src/components/
                    </Text>
                  </div>
                </FlexBox>

                <FlexBox
                  alignItems={FlexBoxAlignItems.Center}
                  style={{ gap: '0.5rem' }}
                >
                  <Icon name="quality-issue" />
                  <div>
                    <Text style={{ fontWeight: 'bold' }}>Add Tests</Text>
                    <Text
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--sapNeutralTextColor)',
                      }}
                    >
                      Write tests in __tests__/
                    </Text>
                  </div>
                </FlexBox>
              </FlexBox>
            </div>
          </Card>
        </FlexBox>

        {/* Resources */}
        <Card>
          <CardHeader
            titleText="Useful Resources"
            subtitleText="Documentation and learning materials"
          />
          <div style={{ padding: '1rem' }}>
            <FlexBox
              direction={FlexBoxDirection.Row}
              style={{ gap: '1rem', flexWrap: 'wrap' }}
            >
              <Link href="https://ui5.sap.com/" target="_blank">
                <Icon name="documents" style={{ marginRight: '0.5rem' }} />
                SAPUI5 Documentation
              </Link>
              <Link href="https://nextjs.org/docs" target="_blank">
                <Icon name="laptop" style={{ marginRight: '0.5rem' }} />
                Next.js Documentation
              </Link>
              <Link
                href="https://sap.github.io/ui5-webcomponents-react/"
                target="_blank"
              >
                <Icon
                  name="learning-assistant"
                  style={{ marginRight: '0.5rem' }}
                />
                UI5 Web Components React
              </Link>
              <Link
                href="https://experience.sap.com/fiori-design-web/"
                target="_blank"
              >
                <Icon
                  name="business-objects-experience"
                  style={{ marginRight: '0.5rem' }}
                />
                SAP Fiori Design Guidelines
              </Link>
            </FlexBox>
          </div>
        </Card>

        {/* Back to Home */}
        <FlexBox
          justifyContent={FlexBoxJustifyContent.Center}
          style={{ marginTop: '2rem', marginBottom: '2rem' }}
        >
          <Button
            design="Emphasized"
            onClick={handleBackToHome}
            icon="home"
            data-testid="back-to-home-button"
          >
            Back to Home
          </Button>
        </FlexBox>
      </FlexBox>
    </Page>
  );
}
