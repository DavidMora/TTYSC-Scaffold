"use client";

import {
  ShellBar,
  ShellBarItem,
  Avatar,
  FlexBox,
  FlexBoxDirection,
} from "@ui5/webcomponents-react";
import Image from "next/image";
import { useState } from "react";
import SideBarMenu from "@/components/AppLayout/SideBar";
import { sideBarItems } from "@/lib/constants/UI/SideBarItems";
import HeaderBar from "@/components/AppLayout/HeaderBar";
import { HEADER_BAR_CONFIG } from "@/lib/constants/UI/HeaderBar";
import AnalysisFilter from "@/components/AnalysisFilters/AnalysisFilters";
import { useAnalysisFilters } from "@/hooks/useAnalysisFilters";
import AnalysisHeader from "../AnalysisHeader/AnalysisHeader";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Readonly<AppLayoutProps>) {
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);

  const handleProfileClick = () => {
    // Handle profile click
    console.log("Profile clicked");
  };

  const {
    filters,
    availableOptions,
    isDisabled,
    handleFilterChange,
    resetFilters,
  } = useAnalysisFilters();

  return (
    <FlexBox
      direction={FlexBoxDirection.Column}
      style={{ minHeight: "100vh", width: "100vw" }}
    >
      {/* Shell Bar */}
      <ShellBar
        primaryTitle="SAPUI5 Next.js App"
        secondaryTitle="CodeBranch Demo Application"
        // logo={<Image src="/next.svg" alt="Logo" width={120} height={32} />}
        profile={
          <Avatar>
            <Image src="/vercel.svg" alt="Profile" width={32} height={32} />
          </Avatar>
        }
        onProfileClick={handleProfileClick}
      >
        <ShellBarItem
          icon="menu2"
          text="Menu"
          onClick={() => setSideNavCollapsed(!sideNavCollapsed)}
        />
      </ShellBar>

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
          }}
        >
          <HeaderBar {...HEADER_BAR_CONFIG.supplyChain} />
          <hr
            style={{
              height: "2px",
              backgroundColor: "var(--sapToolbar_SeparatorColor)",
            }}
          />
          <AnalysisFilter
            filters={filters}
            availableOptions={availableOptions}
            isDisabled={isDisabled}
            handleFilterChange={handleFilterChange}
          />
          <hr
            style={{
              height: "2px",
              backgroundColor: "var(--sapToolbar_SeparatorColor)",
            }}
          />
          <AnalysisHeader onFiltersReset={resetFilters} />
          {children}
        </div>
      </FlexBox>
    </FlexBox>
  );
}
