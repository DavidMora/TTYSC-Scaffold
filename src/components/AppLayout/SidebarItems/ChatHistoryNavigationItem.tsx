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
  errorLoading: Error | undefined;
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

  const renderLoadingState = () => (
    <FlexBox
      direction={FlexBoxDirection.Column}
      className="gap-2 items-center py-4"
    >
      <BusyIndicator active />
      <Text>Loading chat history...</Text>
    </FlexBox>
  );

  const renderErrorState = () => (
    <FlexBox direction={FlexBoxDirection.Column} className="gap-2 py-4">
      <MessageStrip design="Negative">
        {errorLoading?.message ||
          "Error loading chat history. Please try again."}
      </MessageStrip>
    </FlexBox>
  );

  const renderEmptyState = () => (
    <FlexBox
      direction={FlexBoxDirection.Column}
      className="gap-2 items-center py-4"
    >
      <Text className="text-center text-gray-500">No chats yet</Text>
      <Text className="text-center text-sm text-gray-400">
        Start a conversation to see your chat history
      </Text>
    </FlexBox>
  );

  const renderChatMessages = (chat: Chat) => (
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
  );

  const renderChatCard = (chat: Chat) => (
    <Card key={chat.id} className="w-full">
      <Panel
        headerText={chat.title}
        onToggle={() => handleChatToggle(chat.id)}
        noAnimation
        collapsed
      >
        {renderChatMessages(chat)}
      </Panel>
    </Card>
  );

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (errorLoading) {
      return renderErrorState();
    }

    if (chatHistory.length === 0) {
      return renderEmptyState();
    }

    return chatHistory.map(renderChatCard);
  };

  return (
    <SideNavigationItem text="Chat History" icon="timesheet" unselectable>
      <FlexBox direction={FlexBoxDirection.Column} className="gap-2 py-2">
        {renderContent()}
      </FlexBox>
    </SideNavigationItem>
  );
}
