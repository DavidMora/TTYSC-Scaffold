import {
  SideNavigationItem,
  FlexBox,
  FlexBoxDirection,
  Card,
  Panel,
  List,
  ListItemStandard,
} from "@ui5/webcomponents-react";

interface ChatTextItem {
  id: number;
  text: string;
}

interface ChatHistoryItem {
  id: number;
  title: string;
  textItems: ChatTextItem[];
}

interface ChatHistoryNavigationItemProps {
  chatHistory?: ChatHistoryItem[];
  onChatSelect?: (chatId: number) => void;
  onChatItemSelect?: (chatId: number, itemId: number) => void;
}

const defaultChatHistory: ChatHistoryItem[] = [
  {
    id: 1,
    title: "Chat Title",
    textItems: [
      { id: 1, text: "Chat 1" },
      { id: 2, text: "Chat 2" },
      { id: 3, text: "Chat 3" },
    ],
  },
  {
    id: 2,
    title: "Chat Title",
    textItems: [
      { id: 1, text: "Chat 1" },
      { id: 2, text: "Chat 2" },
      { id: 3, text: "Chat 3" },
    ],
  },
  {
    id: 3,
    title: "Chat Title",
    textItems: [
      { id: 1, text: "Chat 1" },
      { id: 2, text: "Chat 2" },
      { id: 3, text: "Chat 3" },
    ],
  },
  {
    id: 4,
    title: "Chat Title",
    textItems: [
      { id: 1, text: "Chat 1" },
      { id: 2, text: "Chat 2" },
      { id: 3, text: "Chat 3" },
    ],
  },
];

export default function ChatHistoryNavigationItem({
  chatHistory = defaultChatHistory,
  onChatSelect,
  onChatItemSelect,
}: Readonly<ChatHistoryNavigationItemProps>) {
  const handleChatToggle = (chatId: number) => {
    onChatSelect?.(chatId);
  };

  const handleChatItemClick = (chatId: number, itemId: number) => {
    onChatItemSelect?.(chatId, itemId);
  };

  return (
    <SideNavigationItem text="Chat History" icon="timesheet" unselectable>
      <FlexBox direction={FlexBoxDirection.Column} className="gap-2 py-2">
        {chatHistory.map((chat) => (
          <Card key={chat.id} className="w-full">
            <Panel
              headerText={chat.title}
              onToggle={() => handleChatToggle(chat.id)}
              noAnimation
              collapsed
            >
              <List>
                {chat.textItems.map((textItem) => (
                  <ListItemStandard
                    key={textItem.id}
                    onClick={() => handleChatItemClick(chat.id, textItem.id)}
                  >
                    {textItem.text}
                  </ListItemStandard>
                ))}
              </List>
            </Panel>
          </Card>
        ))}
      </FlexBox>
    </SideNavigationItem>
  );
}
