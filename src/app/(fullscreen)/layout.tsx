"use client";

import ThemeProvider from "@/providers/ThemeProvider";
import { Button, FlexBox, Icon, Label, Page } from "@ui5/webcomponents-react";
import { useRouter } from "next/navigation";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import "@ui5/webcomponents-icons/dist/arrow-left.js";

export default function FullscreenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { flag: isNavigationEnabled, loading } = useFeatureFlag(
    "FF_Full_Page_Navigation"
  );

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemeProvider>
      <Page
        backgroundDesign="List"
        className="w-screen h-screen overflow-hidden"
      >
        {isNavigationEnabled && !loading && (
          <FlexBox
            direction="Row"
            alignItems="Center"
            gap="0.1rem"
            className="py-4"
            data-testid="flexbox"
          >
            <Button
              design="Transparent"
              onClick={handleBack}
              data-testid="button"
            >
              <Icon
                name="arrow-left"
                className="cursor-pointer"
                data-testid="icon"
              />
            </Button>
            <Label data-testid="label">
              Return to Talk to your Supply Chain
            </Label>
          </FlexBox>
        )}
        {children}
      </Page>
    </ThemeProvider>
  );
}
