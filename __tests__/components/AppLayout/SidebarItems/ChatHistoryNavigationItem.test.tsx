import { render, screen, fireEvent } from "@testing-library/react";
import ChatHistoryNavigationItem from "@/components/AppLayout/SidebarItems/ChatHistoryNavigationItem";
import "@testing-library/jest-dom";

// Mock Panel component to handle onToggle properly
jest.mock("@ui5/webcomponents-react", () => {
  const originalModule = jest.requireActual("@ui5/webcomponents-react");
  return {
    ...originalModule,
    Panel: ({ 
      headerText, 
      children, 
      collapsed, 
      onToggle, 
      ...props 
    }: {
      headerText: string;
      children: React.ReactNode;
      collapsed: boolean;
      onToggle: () => void;
      [key: string]: unknown;
    }) => (
      <button
        type="button"
        data-testid="ui5-panel"
        data-header-text={headerText}
        data-collapsed={collapsed ? "true" : "false"}
        onClick={onToggle}
        {...props}
        style={{ border: 'none', background: 'none', padding: 0, width: '100%', textAlign: 'left' }}
      >
        {children}
      </button>
    ),
  };
});

describe("ChatHistoryNavigationItem", () => {
  const mockOnChatSelect = jest.fn();
  const mockOnChatItemSelect = jest.fn();

  const customChatHistory = [
    {
      id: 1,
      title: "Custom Chat 1",
      textItems: [
        { id: 1, text: "Message 1" },
        { id: 2, text: "Message 2" },
      ],
    },
    {
      id: 2,
      title: "Custom Chat 2",
      textItems: [
        { id: 3, text: "Message 3" },
        { id: 4, text: "Message 4" },
        { id: 5, text: "Message 5" },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<ChatHistoryNavigationItem />);

      expect(screen.getByTestId("ui5-side-navigation-item")).toBeInTheDocument();
      expect(screen.getByTestId("ui5-side-navigation-item")).toHaveAttribute(
        "data-text",
        "Chat History"
      );
      expect(screen.getByTestId("ui5-side-navigation-item")).toHaveAttribute(
        "data-icon",
        "timesheet"
      );
    });

    it("should render with default chat history when no chatHistory prop is provided", () => {
      render(<ChatHistoryNavigationItem />);

      // Should render 4 default chat items (from defaultChatHistory)
      const panels = screen.getAllByTestId("ui5-panel");
      expect(panels).toHaveLength(4);

      // Check that default titles are rendered
      panels.forEach((panel) => {
        expect(panel).toHaveAttribute("data-header-text", "Chat Title");
      });
    });

    it("should render with custom chat history", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      const panels = screen.getAllByTestId("ui5-panel");
      expect(panels).toHaveLength(2);

      expect(panels[0]).toHaveAttribute("data-header-text", "Custom Chat 1");
      expect(panels[1]).toHaveAttribute("data-header-text", "Custom Chat 2");
    });

    it("should render all chat text items", () => {
      render(<ChatHistoryNavigationItem chatHistory={customChatHistory} />);

      // Check first chat items
      expect(screen.getByText("Message 1")).toBeInTheDocument();
      expect(screen.getByText("Message 2")).toBeInTheDocument();

      // Check second chat items
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
      const flexBoxElement = screen.getByTestId("ui5-side-navigation-item").firstChild;
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

      expect(mockOnChatSelect).toHaveBeenCalledWith(1);
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

      expect(mockOnChatSelect).toHaveBeenCalledWith(2);
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

      expect(mockOnChatItemSelect).toHaveBeenCalledWith(1, 1);
    });

    it("should call onChatItemSelect with correct IDs for different items", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatItemSelect={mockOnChatItemSelect}
        />
      );

      // Click on Message 3 (chatId: 2, itemId: 3)
      const listItem = screen.getByText("Message 3");
      fireEvent.click(listItem);

      expect(mockOnChatItemSelect).toHaveBeenCalledWith(2, 3);
    });

    it("should call onChatItemSelect with correct IDs for last item in second chat", () => {
      render(
        <ChatHistoryNavigationItem
          chatHistory={customChatHistory}
          onChatItemSelect={mockOnChatItemSelect}
        />
      );

      // Click on Message 5 (chatId: 2, itemId: 5)
      const listItem = screen.getByText("Message 5");
      fireEvent.click(listItem);

      expect(mockOnChatItemSelect).toHaveBeenCalledWith(2, 5);
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

  describe("Default Chat History", () => {
    it("should render correct number of default chat items", () => {
      render(<ChatHistoryNavigationItem />);

      // Default history has 4 chats, each with 3 text items
      const listItems = screen.getAllByTestId("ui5-list-item-standard");
      expect(listItems).toHaveLength(12); // 4 chats × 3 items each
    });

    it("should render default chat titles", () => {
      render(<ChatHistoryNavigationItem />);

      const panels = screen.getAllByTestId("ui5-panel");
      panels.forEach((panel) => {
        expect(panel).toHaveAttribute("data-header-text", "Chat Title");
      });
    });

    it("should render default chat text items", () => {
      render(<ChatHistoryNavigationItem />);

      // Each default chat has "Chat 1", "Chat 2", "Chat 3"
      const chat1Items = screen.getAllByText("Chat 1");
      const chat2Items = screen.getAllByText("Chat 2");
      const chat3Items = screen.getAllByText("Chat 3");

      expect(chat1Items).toHaveLength(4); // 4 default chats
      expect(chat2Items).toHaveLength(4); // 4 default chats
      expect(chat3Items).toHaveLength(4); // 4 default chats
    });

    it("should handle onChatSelect with default chat history", () => {
      render(<ChatHistoryNavigationItem onChatSelect={mockOnChatSelect} />);

      const panels = screen.getAllByTestId("ui5-panel");
      fireEvent.click(panels[2]); // Third chat (id: 3)

      expect(mockOnChatSelect).toHaveBeenCalledWith(3);
    });

    it("should handle onChatItemSelect with default chat history", () => {
      render(<ChatHistoryNavigationItem onChatItemSelect={mockOnChatItemSelect} />);

      // Get all "Chat 2" items and click the first one (should be from chat id: 1, item id: 2)
      const chat2Items = screen.getAllByText("Chat 2");
      fireEvent.click(chat2Items[0]);

      expect(mockOnChatItemSelect).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty chat history", () => {
      render(<ChatHistoryNavigationItem chatHistory={[]} />);

      expect(screen.getByTestId("ui5-side-navigation-item")).toBeInTheDocument();
      
      // Should not render any panels
      const panels = screen.queryAllByTestId("ui5-panel");
      expect(panels).toHaveLength(0);
    });

    it("should handle chat with empty text items", () => {
      const emptyTextItemsHistory = [
        {
          id: 1,
          title: "Empty Chat",
          textItems: [],
        },
      ];

      render(<ChatHistoryNavigationItem chatHistory={emptyTextItemsHistory} />);

      const panel = screen.getByTestId("ui5-panel");
      expect(panel).toHaveAttribute("data-header-text", "Empty Chat");

      // Should render list but no list items
      const list = screen.getByTestId("ui5-list");
      expect(list).toBeInTheDocument();

      const listItems = screen.queryAllByTestId("ui5-list-item-standard");
      expect(listItems).toHaveLength(0);
    });

    it("should handle single chat with single text item", () => {
      const singleItemHistory = [
        {
          id: 99,
          title: "Single Chat",
          textItems: [{ id: 100, text: "Only Message" }],
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
      expect(mockOnChatSelect).toHaveBeenCalledWith(99);

      // Test clicking the list item
      const listItem = screen.getByText("Only Message");
      fireEvent.click(listItem);
      expect(mockOnChatItemSelect).toHaveBeenCalledWith(99, 100);
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
      expect(mockOnChatSelect).toHaveBeenCalledWith(1);
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
      expect(mockOnChatItemSelect).toHaveBeenCalledWith(1, 2);
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

    it("should cover all default chat history items", () => {
      render(
        <ChatHistoryNavigationItem
          onChatSelect={mockOnChatSelect}
          onChatItemSelect={mockOnChatItemSelect}
        />
      );

      // Click all 4 default panels
      const panels = screen.getAllByTestId("ui5-panel");
      panels.forEach((panel, index) => {
        fireEvent.click(panel);
        expect(mockOnChatSelect).toHaveBeenCalledWith(index + 1);
      });

      // Click some default chat items
      const firstChatItem = screen.getAllByText("Chat 1")[0];
      fireEvent.click(firstChatItem);
      expect(mockOnChatItemSelect).toHaveBeenCalledWith(1, 1);

      const lastChatItem = screen.getAllByText("Chat 3")[3]; // Last "Chat 3" from chat id 4
      fireEvent.click(lastChatItem);
      expect(mockOnChatItemSelect).toHaveBeenCalledWith(4, 3);
    });
  });
});
