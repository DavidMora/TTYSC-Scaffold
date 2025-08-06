import { NavBarItem } from "@/lib/types/NavBarItems";
import {
  SideNavigation,
  SideNavigationItem,
  SideNavigationSubItem,
} from "@ui5/webcomponents-react";
import { usePathname, useRouter } from "next/navigation";
import NvidiaLogo from "@/components/Icons/NvidiaLogo";
import SettingsNavigationItem from "./SidebarItems/SettingsNavigationItem";
import DefinitionsNavigationItem from "./SidebarItems/DefinitionsNavigationItem";
import FeedbackNavigationItem from "./SidebarItems/FeedbackNavigationItem";
import RawDataNavigationItem, {
  type RawDataItem,
} from "./SidebarItems/RawDataNavigationItem";
import ChatHistoryNavigationItem from "./SidebarItems/ChatHistoryNavigationItem";
import { useChats } from "@/hooks/chats";
import "@ui5/webcomponents-icons/dist/inspect.js";
import { CHAT } from "@/lib/constants/routes/Dashboard";
import { useAuth } from "@/hooks/useAuth";

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
  const { logout } = useAuth();

  const {
    data: chatHistory,
    isLoading: isLoadingChatHistory,
    error: chatHistoryError,
  } = useChats();

  const handleFeedbackSubmit = (feedback: string) => {
    console.log("Feedback submitted:", feedback);
    // Implement feedback submission logic here
  };

  const handleRawDataSelection = (
    selectedData: RawDataItem,
    filters: Record<number, string>
  ) => {
    console.log("Raw data selected:", selectedData, filters);
    // Implement data selection logic here
  };

  const handleChatSelect = (chatId: string) => {
    console.log("Chat selected:", chatId);
    // Implement chat selection logic here
  };

  const handleChatItemSelect = (chatId: string) => {
    console.log("Chat item selected:", chatId);
    router.push(CHAT(chatId));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleRestartSession = async () => {
    try {
      // Clear local storage and session storage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Send request to the server to restart the session
      const response = await fetch("/api/auth/restart-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Session restarted successfully");
        // You might want to trigger a refresh of certain components here
        // or show a success message to the user
      } else {
        console.error("Failed to restart session:", await response.text());
      }
    } catch (error) {
      console.error("Error during session restart:", error);
    }
  };

  const handleNavSelection = (event: {
    detail?: { item?: { dataset?: { path?: string; action?: string } } };
  }) => {
    const path = event.detail?.item?.dataset?.path;
    const action = event.detail?.item?.dataset?.action;

    if (action === "logout") {
      handleLogout();
    } else if (action === "restart") {
      handleRestartSession();
    } else if (path) {
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
          <SideNavigationItem
            icon="restart"
            text="Restart Session"
            data-action="restart"
          />
          <SideNavigationItem
            icon="journey-arrive"
            text="Log Out"
            data-action="logout"
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
  );
};

export default SideBarMenu;
