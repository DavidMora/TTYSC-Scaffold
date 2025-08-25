import React, { useState } from 'react';
import { NavBarItem } from '@/lib/types/NavBarItems';
import {
  SideNavigation,
  SideNavigationItem,
  SideNavigationSubItem,
} from '@ui5/webcomponents-react';
import { usePathname, useRouter } from 'next/navigation';
import NvidiaLogo from '@/components/Icons/NvidiaLogo';
import SettingsNavigationItem from './SidebarItems/SettingsNavigationItem';
import DefinitionsNavigationItem from './SidebarItems/DefinitionsNavigationItem';
import FeedbackNavigationItem from './SidebarItems/FeedbackNavigationItem';
import RawDataNavigationItem, {
  type RawDataItem,
} from './SidebarItems/RawDataNavigationItem';
import ChatHistoryNavigationItem from './SidebarItems/ChatHistoryNavigationItem';
import { useChats } from '@/hooks/chats';
import '@ui5/webcomponents-icons/dist/inspect.js';
import { CHAT } from '@/lib/constants/routes/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { FeatureNotAvailable } from '@/components/FeatureNotAvailable';
import { ConfirmationModal } from '@/components/Modals/ConfirmationModal';

interface SideBarProps {
  sideNavCollapsed?: boolean;
  navItems: Array<NavBarItem>;
  //onShowRawDataModal?: () => void;
}

const SideBarMenu: React.FC<SideBarProps> = ({
  sideNavCollapsed,
  navItems,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, restartSession } = useAuth();
  const { flag: isSideNavEnabled, loading } = useFeatureFlag('FF_SIDE_NAVBAR');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const {
    data: chatHistory,
    isLoading: isLoadingChatHistory,
    error: chatHistoryError,
  } = useChats();

  const handleFeedbackSubmit = (feedback: string) => {
    console.log('Feedback submitted:', feedback);
    // Implement feedback submission logic here
  };

  const handleRawDataSelection = (
    selectedData: RawDataItem,
    filters: Record<number, string>
  ) => {
    console.log('Raw data selected:', selectedData, filters);
    // Implement data selection logic here
  };

  const handleChatSelect = (chatId: string) => {
    console.log('Chat selected:', chatId);
    // Implement chat selection logic here
  };

  const handleChatItemSelect = (chatId: string) => {
    console.log('Chat item selected:', chatId);
    router.push(CHAT(chatId));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleRestartSession = async () => {
    try {
      await restartSession();
    } catch (error) {
      console.error('Error during restart session:', error);
    }
  };

  const handleNavSelection = (event: {
    detail?: { item?: { dataset?: { path?: string } } };
  }) => {
    const path = event.detail?.item?.dataset?.path;
    if (path) {
      router.push(path);
    }
  };

  if (loading) {
    return null;
  }

  if (!isSideNavEnabled) {
    return (
      <FeatureNotAvailable
        title="Navigation Not Available"
        message="The side navigation is currently disabled."
      />
    );
  }

  return (
    <>
      <SideNavigation
        collapsed={sideNavCollapsed}
        onSelectionChange={handleNavSelection}
        header={
          <div className="flex justify-center items-center p-8">
            <NvidiaLogo className="w-full max-w-[7.5rem]" />
          </div>
        }
        fixedItems={
          <>
            <SideNavigationItem
              icon="restart"
              text="Restart Session"
              data-action="restart"
              selected={false}
              onClick={handleRestartSession}
            />
            <SideNavigationItem
              icon="journey-arrive"
              text="Log Out"
              data-action="logout"
              selected={false}
              onClick={() => setIsLogoutModalOpen(true)}
            />
          </>
        }
      >
        {/* Custom Navigation Items */}
        <SettingsNavigationItem />
        <DefinitionsNavigationItem />
        <FeedbackNavigationItem onSubmitFeedback={handleFeedbackSubmit} />
        <RawDataNavigationItem onDataSelection={handleRawDataSelection} />
        <ChatHistoryNavigationItem
          chatHistory={chatHistory?.data}
          isLoading={isLoadingChatHistory}
          errorLoading={chatHistoryError}
          onChatSelect={handleChatSelect}
          onChatItemSelect={handleChatItemSelect}
        />

        {/* Navigation Items */}
        {navItems.map((item) => (
          <SideNavigationItem
            key={item.path || item.text}
            text={item.text}
            icon={item.icon}
            unselectable={!!item.subItems?.length}
            selected={item.path ? pathname === item.path : false}
            data-path={item.path || undefined}
          >
            {item.subItems?.map((subItem) => (
              <SideNavigationSubItem
                key={subItem.path}
                text={subItem.text}
                icon={subItem.icon}
                selected={pathname === subItem.path}
                data-path={subItem.path}
              />
            ))}
          </SideNavigationItem>
        ))}
      </SideNavigation>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Log Out?"
        message="Do you really want to log out?"
        description="If you log out of the application now, please keep in mind that any unsaved changes will be lost. It's advisable to save your work before logging out to ensure that you don't lose any important information."
        iconName="alert"
        actions={[
          {
            label: 'Close',
            design: 'Transparent',
            onClick: () => setIsLogoutModalOpen(false),
          },
          {
            label: 'Log Out',
            design: 'Emphasized',
            onClick: () => {
              setIsLogoutModalOpen(false);
              handleLogout();
            },
          },
        ]}
      />
    </>
  );
};

export default SideBarMenu;
