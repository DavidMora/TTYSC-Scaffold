import {
  SideNavigationItem,
  FlexBox,
  FlexBoxDirection,
  Card,
  Panel,
  List,
  ListItemStandard,
  BusyIndicator,
  Text,
  MessageStrip,
} from "@ui5/webcomponents-react";
import { Chat } from "@/lib/types/chats";

interface ChatHistoryNavigationItemProps {
  chatHistory?: Chat[];
  isLoading?: boolean;
  errorLoading?: Error | undefined;
  onChatSelect?: (chatId: string) => void;
  onChatItemSelect?: (chatId: string, itemId: string) => void;
}

const defaultChatHistory: Chat[] = [];

export default function ChatHistoryNavigationItem({
  chatHistory = defaultChatHistory,
  isLoading = false,
  errorLoading,
  onChatSelect,
  onChatItemSelect,
}: Readonly<ChatHistoryNavigationItemProps>) {
  const handleChatToggle = (chatId: string) => {
    onChatSelect?.(chatId);
  };

  const handleChatItemClick = (chatId: string, itemId: string) => {
    onChatItemSelect?.(chatId, itemId);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <FlexBox
          direction={FlexBoxDirection.Column}
          className="gap-2 items-center py-4"
        >
          <BusyIndicator active />
          <Text>Loading chat history...</Text>
        </FlexBox>
      );
    }

    if (errorLoading) {
      return (
        <FlexBox direction={FlexBoxDirection.Column} className="gap-2 py-4">
          <MessageStrip design="Negative">
            {errorLoading.message ||
              "Error loading chat history. Please try again."}
          </MessageStrip>
        </FlexBox>
      );
    }

    return chatHistory.map((chat) => (
      <Card key={chat.id} className="w-full">
        <Panel
          headerText={chat.title}
          onToggle={() => handleChatToggle(chat.id)}
          noAnimation
          collapsed
        >
          <List>
            {chat.messages.map((message) => (
              <ListItemStandard
                key={message.id}
                onClick={() => handleChatItemClick(chat.id, message.id)}
              >
                {message.content}
              </ListItemStandard>
            ))}
          </List>
        </Panel>
      </Card>
    ));
  };

  return (
    <SideNavigationItem text="Chat History" icon="timesheet" unselectable>
      <FlexBox direction={FlexBoxDirection.Column} className="gap-2 py-2">
        {renderContent()}
      </FlexBox>
    </SideNavigationItem>
  );
}
