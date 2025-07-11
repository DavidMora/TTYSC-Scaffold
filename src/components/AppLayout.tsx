"use client";

import {
  ShellBar,
  ShellBarItem,
  Avatar,
  SideNavigation,
  SideNavigationItem,
  SideNavigationSubItem,
  FlexBox,
  FlexBoxDirection,
} from "@ui5/webcomponents-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Readonly<AppLayoutProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleProfileClick = () => {
    // Handle profile click
    console.log("Profile clicked");
  };

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
          <SideNavigation
            collapsed={sideNavCollapsed}
            onSelectionChange={(event) => {
              const selectedItem = event.detail.item;
              const path = selectedItem.dataset.path;
              if (path) {
                handleNavigation(path);
              }
            }}
          >
            <SideNavigationItem
              text="Home"
              icon="information"
              selected={pathname === "/"}
              data-path="/"
            />
            <SideNavigationItem
              text="About"
              icon="information"
              selected={pathname === "/about"}
              data-path="/about"
            />
            <SideNavigationItem text="More" icon="information">
              <SideNavigationSubItem text="Documentation" />
              <SideNavigationSubItem text="Settings" />
            </SideNavigationItem>
          </SideNavigation>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "0rem",
            overflow: "auto",
            backgroundColor: "var(--sapBackgroundColor)",
          }}
        >
          {children}
        </div>
      </FlexBox>
    </FlexBox>
  );
}
