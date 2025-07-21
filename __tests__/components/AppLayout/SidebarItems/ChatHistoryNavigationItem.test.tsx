import { render, screen, fireEvent } from "@testing-library/react";
import ChatHistoryNavigationItem from "@/components/AppLayout/SidebarItems/ChatHistoryNavigationItem";
import { Chat } from "@/lib/types/chats";
import "@testing-library/jest-dom";

describe("ChatHistoryNavigationItem", () => {
  const mockOnChatSelect = jest.fn();
  const mockOnChatItemSelect = jest.fn();

  const customChatHistory: Chat[] = [
    {
      id: "chat-1",
      title: "Custom Chat 1",
      date: "2024-01-01",
      participants: [
        { id: "user-1", name: "User 1" },
        { id: "user-2", name: "User 2" },
      ],
      messages: [
        {
          id: "msg-1",
          sender: "user-1",
          timestamp: "2024-01-01T10:00:00Z",
          content: "Message 1",
        },
        {
          id: "msg-2",
          sender: "user-2",
          timestamp: "2024-01-01T10:01:00Z",
          content: "Message 2",
        },
      ],
    },
    {
      id: "chat-2",
      title: "Custom Chat 2",
      date: "2024-01-02",
      participants: [
        { id: "user-1", name: "User 1" },
        { id: "user-3", name: "User 3" },
      ],
      messages: [
        {
          id: "msg-3",
          sender: "user-1",
          timestamp: "2024-01-02T10:00:00Z",
          content: "Message 3",
        },
        {
          id: "msg-4",
          sender: "user-3",
          timestamp: "2024-01-02T10:01:00Z",
          content: "Message 4",
        },
        {
          id: "msg-5",
          sender: "user-1",
          timestamp: "2024-01-02T10:02:00Z",
          content: "Message 5",
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<ChatHistoryNavigationItem />);

      expect(
        screen.getByTestId("ui5-side-navigation-item")
      ).toBeInTheDocument();
      expect(screen.getByTestId("ui5-side-navigation-item")).toHaveAttribute(
        "data-text",
        "Chat History"
      );
      expect(screen.getByTestId("ui5-side-navigation-item")).toHaveAttribute(
        "data-icon",
        "timesheet"
      );
    });

    it("should render empty state when no chatHistory prop is provided", () => {
      render(<ChatHistoryNavigationItem />);

      // Should not render any panels since default is now an empty array
      const panels = screen.queryAllByTestId("ui5-panel");
      expect(panels).toHaveLength(0);
    });

    it("should render with custom chat history", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      const panels = screen.getAllByTestId("ui5-panel");
      expect(panels).toHaveLength(2);

      expect(panels[0]).toHaveAttribute("data-header-text", "Custom Chat 1");
      expect(panels[1]).toHaveAttribute("data-header-text", "Custom Chat 2");
    });

    it("should render all chat messages", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      // Check first chat messages
      expect(screen.getByText("Message 1")).toBeInTheDocument();
      expect(screen.getByText("Message 2")).toBeInTheDocument();

      // Check second chat messages
      expect(screen.getByText("Message 3")).toBeInTheDocument();
      expect(screen.getByText("Message 4")).toBeInTheDocument();
      expect(screen.getByText("Message 5")).toBeInTheDocument();
    });

    it("should render cards with correct structure", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      const cards = screen.getAllByTestId("ui5-card");
      expect(cards).toHaveLength(2);

      cards.forEach((card) => {
        expect(card).toHaveClass("w-full");
      });
    });

    it("should render FlexBox with correct direction and classes", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      // FlexBox is rendered as a div with flex styles
      const flexBoxElement = screen.getByTestId(
        "ui5-side-navigation-item"
      ).firstChild;
      expect(flexBoxElement).toHaveClass("gap-2", "py-2");
      expect(flexBoxElement).toHaveStyle("flex-direction: column");
    });

    it("should render lists for each chat", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      const lists = screen.getAllByTestId("ui5-list");
      expect(lists).toHaveLength(2);
    });

    it("should render list items with correct structure", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      const listItems = screen.getAllByTestId("ui5-list-item-standard");
      expect(listItems).toHaveLength(5); // 2 + 3 items from custom chat history
    });

    it("should render panels with correct attributes", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      const panels = screen.getAllByTestId("ui5-panel");
      panels.forEach((panel) => {
        expect(panel).toHaveAttribute("data-collapsed", "true");
      });
    });
  });

  describe("Event Handling", () => {
    it("should call onChatSelect when panel is clicked", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatSelect={mockOnChatSelect}
        />
      );

      const panels = screen.getAllByTestId("ui5-panel");

      // Simulate panel click since the mock maps onToggle to onClick
      fireEvent.click(panels[0]);

      expect(mockOnChatSelect).toHaveBeenCalledWith("chat-1");
    });

    it("should call onChatSelect with correct chat ID for different chats", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatSelect={mockOnChatSelect}
        />
      );

      const panels = screen.getAllByTestId("ui5-panel");

      fireEvent.click(panels[1]);

      expect(mockOnChatSelect).toHaveBeenCalledWith("chat-2");
    });

    it("should call onChatItemSelect when list item is clicked", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatItemSelect={mockOnChatItemSelect}
        />
      );

      const listItem = screen.getByText("Message 1");
      fireEvent.click(listItem);

      expect(mockOnChatItemSelect).toHaveBeenCalledWith("chat-1", "msg-1");
    });

    it("should call onChatItemSelect with correct IDs for different items", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatItemSelect={mockOnChatItemSelect}
        />
      );

      // Click on Message 3 (chatId: "chat-2", itemId: "msg-3")
      const listItem = screen.getByText("Message 3");
      fireEvent.click(listItem);

      expect(mockOnChatItemSelect).toHaveBeenCalledWith("chat-2", "msg-3");
    });

    it("should call onChatItemSelect with correct IDs for last item in second chat", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatItemSelect={mockOnChatItemSelect}
        />
      );

      // Click on Message 5 (chatId: "chat-2", itemId: "msg-5")
      const listItem = screen.getByText("Message 5");
      fireEvent.click(listItem);

      expect(mockOnChatItemSelect).toHaveBeenCalledWith("chat-2", "msg-5");
    });

    it("should not call onChatSelect when prop is not provided", () => {
      // This test ensures that the optional callback doesn't cause errors
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      const panels = screen.getAllByTestId("ui5-panel");
      fireEvent.click(panels[0]);

      // Should not throw any errors
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should not call onChatItemSelect when prop is not provided", () => {
      // This test ensures that the optional callback doesn't cause errors
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      const listItem = screen.getByText("Message 1");
      fireEvent.click(listItem);

      // Should not throw any errors
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("Loading and Error States", () => {
    it("should render loading state", () => {
      render(<ChatHistoryNavigationItem isLoading={true} />);

      expect(screen.getByTestId("ui5-busy-indicator")).toBeInTheDocument();
      expect(screen.getByText("Loading chat history...")).toBeInTheDocument();

      // Should not render any panels
      const panels = screen.queryAllByTestId("ui5-panel");
      expect(panels).toHaveLength(0);
    });

    it("should render error state", () => {
      const error = new Error("Failed to load chat history");
      render(<ChatHistoryNavigationItem errorLoading={error} />);

      expect(screen.getByTestId("ui5-messagestrip")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load chat history")
      ).toBeInTheDocument();

      // Should not render any panels
      const panels = screen.queryAllByTestId("ui5-panel");
      expect(panels).toHaveLength(0);
    });

    it("should render error state with default message when error has no message", () => {
      const error = new Error("");
      render(<ChatHistoryNavigationItem errorLoading={error} />);

      expect(screen.getByTestId("ui5-messagestrip")).toBeInTheDocument();
      expect(
        screen.getByText("Error loading chat history. Please try again.")
      ).toBeInTheDocument();
    });

    it("should render error state with default message when error is undefined", () => {
      const error = {} as Error;
      render(<ChatHistoryNavigationItem errorLoading={error} />);

      expect(screen.getByTestId("ui5-messagestrip")).toBeInTheDocument();
      expect(
        screen.getByText("Error loading chat history. Please try again.")
      ).toBeInTheDocument();
    });

    it("should prioritize loading state over error state", () => {
      const error = new Error("Failed to load");
      render(
        <ChatHistoryNavigationItem isLoading={true} errorLoading={error} />
      );

      expect(screen.getByTestId("ui5-busy-indicator")).toBeInTheDocument();
      expect(screen.getByText("Loading chat history...")).toBeInTheDocument();
      expect(screen.queryByTestId("ui5-messagestrip")).not.toBeInTheDocument();
    });

    it("should not render loading or error states when data is available", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      expect(
        screen.queryByTestId("ui5-busy-indicator")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("ui5-messagestrip")).not.toBeInTheDocument();
      expect(screen.getAllByTestId("ui5-panel")).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty chat history", () => {
      render(<ChatHistoryNavigationItem chatHistory={[]} />);

      expect(
        screen.getByTestId("ui5-side-navigation-item")
      ).toBeInTheDocument();

      // Should not render any panels
      const panels = screen.queryAllByTestId("ui5-panel");
      expect(panels).toHaveLength(0);
    });

    it("should handle chat with empty messages", () => {
      const emptyMessagesHistory: Chat[] = [
        {
          id: "empty-chat-1",
          title: "Empty Chat",
          date: "2024-01-01",
          participants: [{ id: "user-1", name: "User 1" }],
          messages: [],
        },
      ];

      render(<ChatHistoryNavigationItem chatHistory={emptyMessagesHistory} />);

      const panel = screen.getByTestId("ui5-panel");
      expect(panel).toHaveAttribute("data-header-text", "Empty Chat");

      // Should render list but no list items
      const list = screen.getByTestId("ui5-list");
      expect(list).toBeInTheDocument();

      const listItems = screen.queryAllByTestId("ui5-list-item-standard");
      expect(listItems).toHaveLength(0);
    });

    it("should handle single chat with single message", () => {
      const singleItemHistory: Chat[] = [
        {
          id: "single-chat-99",
          title: "Single Chat",
          date: "2024-01-01",
          participants: [{ id: "user-1", name: "User 1" }],
          messages: [
            {
              id: "msg-100",
              sender: "user-1",
              timestamp: "2024-01-01T10:00:00Z",
              content: "Only Message",
            },
          ],
        },
      ];

      render(
        <ChatHistoryNavigationItem
          chatHistory={singleItemHistory}
          onChatSelect={mockOnChatSelect}
          onChatItemSelect={mockOnChatItemSelect}
        />
      );

      expect(screen.getByText("Only Message")).toBeInTheDocument();

      // Test clicking the panel
      const panel = screen.getByTestId("ui5-panel");
      fireEvent.click(panel);
      expect(mockOnChatSelect).toHaveBeenCalledWith("single-chat-99");

      // Test clicking the list item
      const listItem = screen.getByText("Only Message");
      fireEvent.click(listItem);
      expect(mockOnChatItemSelect).toHaveBeenCalledWith(
        "single-chat-99",
        "msg-100"
      );
    });
  });

  describe("Component Structure", () => {
    it("should have correct SideNavigationItem attributes", () => {
      render(<ChatHistoryNavigationItem />);

      const sideNavItem = screen.getByTestId("ui5-side-navigation-item");
      expect(sideNavItem).toHaveAttribute("data-text", "Chat History");
      expect(sideNavItem).toHaveAttribute("data-icon", "timesheet");
    });

    it("should render with timesheet icon", () => {
      render(<ChatHistoryNavigationItem />);

      const sideNavItem = screen.getByTestId("ui5-side-navigation-item");
      expect(sideNavItem).toHaveAttribute("data-icon", "timesheet");
    });

    it("should render with correct text", () => {
      render(<ChatHistoryNavigationItem />);

      const sideNavItem = screen.getByTestId("ui5-side-navigation-item");
      expect(sideNavItem).toHaveAttribute("data-text", "Chat History");
    });

    it("should maintain component keys for React rendering", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      // Ensure that each card has proper React keys by checking they're rendered correctly
      const cards = screen.getAllByTestId("ui5-card");
      expect(cards).toHaveLength(2);

      // Verify that text items are rendered with proper keys
      const listItems = screen.getAllByTestId("ui5-list-item-standard");
      expect(listItems).toHaveLength(5);
    });
  });

  describe("Function Coverage", () => {
    it("should execute handleChatToggle function", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatSelect={mockOnChatSelect}
        />
      );

      const panels = screen.getAllByTestId("ui5-panel");
      fireEvent.click(panels[0]);

      expect(mockOnChatSelect).toHaveBeenCalledTimes(1);
      expect(mockOnChatSelect).toHaveBeenCalledWith("chat-1");
    });

    it("should execute handleChatItemClick function", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatItemSelect={mockOnChatItemSelect}
        />
      );

      const listItem = screen.getByText("Message 2");
      fireEvent.click(listItem);

      expect(mockOnChatItemSelect).toHaveBeenCalledTimes(1);
      expect(mockOnChatItemSelect).toHaveBeenCalledWith("chat-1", "msg-2");
    });

    it("should handle optional callback parameters correctly", () => {
      // Test with undefined callbacks
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      const panel = screen.getAllByTestId("ui5-panel")[0];
      const listItem = screen.getByText("Message 1");

      // These should not throw errors
      expect(() => {
        fireEvent.click(panel);
        fireEvent.click(listItem);
      }).not.toThrow();
    });

    it("should render content when chat history is provided", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatSelect={mockOnChatSelect}
          onChatItemSelect={mockOnChatItemSelect}
        />
      );

      // Click all panels
      const panels = screen.getAllByTestId("ui5-panel");
      panels.forEach((panel, index) => {
        fireEvent.click(panel);
        expect(mockOnChatSelect).toHaveBeenCalledWith(
          index === 0 ? "chat-1" : "chat-2"
        );
      });

      // Click some chat items
      const firstChatMessage = screen.getByText("Message 1");
      fireEvent.click(firstChatMessage);
      expect(mockOnChatItemSelect).toHaveBeenCalledWith("chat-1", "msg-1");

      const lastChatMessage = screen.getByText("Message 5");
      fireEvent.click(lastChatMessage);
      expect(mockOnChatItemSelect).toHaveBeenCalledWith("chat-2", "msg-5");
    });

    it("should cover renderContent function branches", () => {
      // Test loading branch
      const { rerender } = render(
        <ChatHistoryNavigationItem isLoading={true} />
      );
      expect(screen.getByTestId("ui5-busy-indicator")).toBeInTheDocument();

      // Test error branch
      rerender(
        <ChatHistoryNavigationItem errorLoading={new Error("Test error")} />
      );
      expect(screen.getByTestId("ui5-messagestrip")).toBeInTheDocument();

      // Test normal content branch
      rerender(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);
      expect(screen.getAllByTestId("ui5-panel")).toHaveLength(2);
    });
  });
});
