"use client";

import { FlexBox, FlexBoxDirection } from "@ui5/webcomponents-react";
import { useState } from "react";
import SideBarMenu from "@/components/AppLayout/SideBar";
import { sideBarItems } from "@/lib/constants/UI/SideBarItems";
import HeaderBar from "@/components/AppLayout/HeaderBar";
import { HEADER_BAR_CONFIG } from "@/lib/constants/UI/HeaderBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Readonly<AppLayoutProps>) {
  const [sideNavCollapsed] = useState(false);
  return (
    <FlexBox
      direction={FlexBoxDirection.Column}
      style={{ height: "100vh", width: "100vw" }}
    >
      <FlexBox style={{ flex: 1, overflow: "hidden" }}>
        {/* Side Navigation */}
        <div
          style={{
            minWidth: "auto",
            transition: "min-width 0.3s ease",
            borderRight: "1px solid var(--sapGroup_TitleBorderColor)",
            backgroundColor: "var(--sapGroup_ContentBackground)",
          }}
        >
          <SideBarMenu
            sideNavCollapsed={sideNavCollapsed}
            navItems={sideBarItems}
          />
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "1rem",
            overflow: "auto",
            backgroundColor: "var(--sapGroup_ContentBackground)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            position: "relative",
            paddingBottom: "10px",
          }}
        >
          <HeaderBar {...HEADER_BAR_CONFIG.supplyChain} />
          <hr
            style={{
              height: "2px",
              backgroundColor: "var(--sapToolbar_SeparatorColor)",
            }}
          />
          {children}
        </div>
      </FlexBox>
    </FlexBox>
  );
}
