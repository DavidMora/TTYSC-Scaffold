'use client';

import { FlexBox, FlexBoxDirection } from '@ui5/webcomponents-react';
import { useState } from 'react';
import {
  RawDataModalProvider,
  useRawDataModal,
} from '@/contexts/RawDataModalContext';
import SideBarMenu from '@/components/AppLayout/SideBar';
import { sideBarItems } from '@/lib/constants/UI/SideBarItems';
import HeaderBar from '@/components/AppLayout/HeaderBar';
import { HEADER_BAR_CONFIG } from '@/lib/constants/UI/HeaderBar';
import { RawDataModal } from '../Modals/RawDataModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Readonly<AppLayoutProps>) {
  const [sideNavCollapsed] = useState(false);

  return (
    <RawDataModalProvider>
      <FlexBox
        direction={FlexBoxDirection.Column}
        className="h-screen w-screen"
      >
        <FlexBox className="flex flex-1 overflow-hidden">
          {/* Side Navigation */}
          <div
            className="
              border-r
              border-[var(--sapGroup_TitleBorderColor)]
              bg-[var(--sapGroup_ContentBackground)]
              min-w-auto
            "
          >
            <SideBarMenu
              sideNavCollapsed={sideNavCollapsed}
              navItems={sideBarItems}
            />
          </div>

          {/* Main Content */}
          <div
            className="
              flex-1 p-4 overflow-auto bg-[var(--sapGroup_ContentBackground)]
              flex flex-col gap-4 relative pb-[10px]
            "
          >
            <HeaderBar {...HEADER_BAR_CONFIG.supplyChain} />
            <div className="h-[2px] bg-[var(--sapToolbar_SeparatorColor)]" />
            {children}
            <RawDataModalWithContext />
          </div>
        </FlexBox>
      </FlexBox>
    </RawDataModalProvider>
  );
}

function RawDataModalWithContext() {
  const { isOpen, close } = useRawDataModal();
  return <RawDataModal data={[]} open={isOpen} onClose={close} />;
}
