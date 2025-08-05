"use client";

import ThemeProvider from "@/providers/ThemeProvider";
import { FlexBox, Icon, Label, Page } from "@ui5/webcomponents-react";
import { useRouter } from "next/navigation";
import "@ui5/webcomponents-icons/dist/arrow-left.js";

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemeProvider>
      <Page
        backgroundDesign="List"
        className="w-screen h-screen overflow-hidden"
      >
        <FlexBox
          direction="Row"
          alignItems="Center"
          gap="1rem"
          className="py-4"
        >
          <Icon
            name="arrow-left"
            className="cursor-pointer"
            onClick={handleBack}
          />
          <Label>Return to Talk to your Supply Chain</Label>
        </FlexBox>
        {children}
      </Page>
    </ThemeProvider>
  );
}
