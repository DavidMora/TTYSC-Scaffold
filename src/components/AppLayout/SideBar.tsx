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

interface SideBarProps {
  sideNavCollapsed?: boolean;
  navItems: Array<NavBarItem>;
  onShowRawDataModal?: () => void;
}

const SideBarMenu: React.FC<SideBarProps> = ({
  sideNavCollapsed,
  navItems,
}) => {
  const pathname = usePathname();
  const router = useRouter();

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

  const handleChatItemSelect = (chatId: string, itemId: string) => {
    console.log('Chat item selected:', chatId, itemId);
    // Implement chat item selection logic here
  };

  const handleNavSelection = (event: {
    detail?: { item?: { dataset?: { path?: string } } };
  }) => {
    const path = event.detail?.item?.dataset?.path;
    if (path) {
      router.push(path);
    }
  };

  return (
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
          <SideNavigationItem icon="restart" text="Restart Session" />
          <SideNavigationItem icon="journey-arrive" text="Log Out" />
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
          unselectable={item.subItems?.length !== 0}
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
  );
};

export default SideBarMenu;
