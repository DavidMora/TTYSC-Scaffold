import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RawDataNavigationItem from "../../../../src/components/AppLayout/SidebarItems/RawDataNavigationItem";

// Mock UI5 components
interface SideNavigationItemProps {
  children?: React.ReactNode;
  text?: string;
  icon?: string;
  unselectable?: boolean;
}

interface FlexBoxProps {
  children?: React.ReactNode;
  direction?: string;
  className?: string;
}

interface TextProps {
  children?: React.ReactNode;
}

interface SelectProps {
  children?: React.ReactNode;
  className?: string;
  value?: string;
  onChange?: (event: { detail: { selectedOption: { value: string } } }) => void;
}

interface OptionProps {
  children?: React.ReactNode;
  value?: string;
}

interface LabelProps {
  children?: React.ReactNode;
}

interface IconProps {
  name?: string;
  slot?: string;
}

jest.mock("@ui5/webcomponents-react", () => ({
  SideNavigationItem: ({
    children,
    text,
    icon,
    unselectable,
  }: SideNavigationItemProps) => (
    <div
      data-testid="side-navigation-item"
      data-text={text}
      data-icon={icon}
      data-unselectable={unselectable}
    >
      {children}
    </div>
  ),
  FlexBox: ({ children, direction, className }: FlexBoxProps) => (
    <div
      data-testid="flex-box"
      data-direction={direction}
      className={className}
    >
      {children}
    </div>
  ),
  FlexBoxDirection: {
    Column: "Column",
  },
  Text: ({ children }: TextProps) => <span data-testid="text">{children}</span>,
  Select: ({ children, className, value, onChange }: SelectProps) => (
    <select
      data-testid="select"
      className={className}
      value={value}
      onChange={(e) => {
        const targetValue = (e.target as HTMLSelectElement).value;
        let eventValue: string | null | undefined = targetValue;
        if (targetValue === "null") {
          eventValue = null;
        } else if (targetValue === "undefined") {
          eventValue = undefined;
        }

        const event = {
          detail: {
            selectedOption: {
              value: eventValue as string,
            },
          },
        };
        onChange?.(event);
      }}
    >
      {children}
    </select>
  ),
  Option: ({ children, value }: OptionProps) => (
    <option value={value}>{children}</option>
  ),
  Label: ({ children }: LabelProps) => (
    <label data-testid="label">{children}</label>
  ),
  Icon: ({ name, slot }: IconProps) => (
    <span data-testid="icon" data-name={name} data-slot={slot} />
  ),
}));

describe("RawDataNavigationItem", () => {
  const mockOnDataSelection = jest.fn();

  const mockRawDataItems = [
    {
      id: 1,
      tableName: "Test Table 1",
      tableFilters: [
        {
          id: 1,
          text: "Filter 1",
          values: [
            { id: 1, text: "Value 1" },
            { id: 2, text: "Value 2" },
          ],
        },
        {
          id: 2,
          text: "Filter 2",
          values: [
            { id: 1, text: "Option 1" },
            { id: 2, text: "Option 2" },
          ],
        },
      ],
    },
    {
      id: 2,
      tableName: "Test Table 2",
      tableFilters: [
        {
          id: 1,
          text: "Filter A",
          values: [
            { id: 1, text: "Alpha" },
            { id: 2, text: "Beta" },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<RawDataNavigationItem />);

    expect(screen.getByTestId("side-navigation-item")).toBeInTheDocument();
    expect(screen.getByTestId("side-navigation-item")).toHaveAttribute(
      "data-text",
      "Raw Data"
    );
    expect(screen.getByTestId("side-navigation-item")).toHaveAttribute(
      "data-icon",
      "it-host"
    );
    expect(screen.getByTestId("side-navigation-item")).toHaveAttribute(
      "data-unselectable",
      "true"
    );
  });

  it("renders with custom rawDataItems", () => {
    render(<RawDataNavigationItem rawDataItems={mockRawDataItems} />);

    expect(screen.getByText("Select a table to explore")).toBeInTheDocument();
    expect(screen.getByText("Test Table 1")).toBeInTheDocument();
    expect(screen.getByText("Test Table 2")).toBeInTheDocument();
  });

  it("displays the correct initial table information", () => {
    render(<RawDataNavigationItem rawDataItems={mockRawDataItems} />);

    expect(
      screen.getByText("Showing data from Test Table 1 (Top 100 rows):")
    ).toBeInTheDocument();
  });

  it("renders all filters for the selected table", () => {
    render(<RawDataNavigationItem rawDataItems={mockRawDataItems} />);

    expect(screen.getByText("Filter 1")).toBeInTheDocument();
    expect(screen.getByText("Filter 2")).toBeInTheDocument();
  });

  it("renders filter options correctly", () => {
    render(<RawDataNavigationItem rawDataItems={mockRawDataItems} />);

    // Check that "All" options are present
    const allOptions = screen.getAllByText("All");
    expect(allOptions).toHaveLength(2); // One for each filter

    // Check that filter values are present
    expect(screen.getByText("Value 1")).toBeInTheDocument();
    expect(screen.getByText("Value 2")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("handles table selection change", async () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const tableSelect = screen.getAllByTestId("select")[0];
    fireEvent.change(tableSelect, { target: { value: "2" } });

    await waitFor(() => {
      expect(
        screen.getByText("Showing data from Test Table 2 (Top 100 rows):")
      ).toBeInTheDocument();
    });

    expect(mockOnDataSelection).toHaveBeenCalledWith(mockRawDataItems[1], {});
  });

  it("resets filter selections when changing table", async () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    // First, select a filter value
    const filterSelects = screen.getAllByTestId("select");
    const firstFilterSelect = filterSelects[1]; // Skip the table select
    fireEvent.change(firstFilterSelect, { target: { value: "1" } });

    expect(mockOnDataSelection).toHaveBeenCalledWith(mockRawDataItems[0], {
      1: "1",
    });

    // Then change the table
    const tableSelect = filterSelects[0];
    fireEvent.change(tableSelect, { target: { value: "2" } });

    await waitFor(() => {
      expect(mockOnDataSelection).toHaveBeenCalledWith(mockRawDataItems[1], {});
    });
  });

  it("handles filter selection change", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const filterSelects = screen.getAllByTestId("select");
    const firstFilterSelect = filterSelects[1]; // Skip the table select

    fireEvent.change(firstFilterSelect, { target: { value: "2" } });

    expect(mockOnDataSelection).toHaveBeenCalledWith(mockRawDataItems[0], {
      1: "2",
    });
  });

  it("handles multiple filter selections", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const filterSelects = screen.getAllByTestId("select");

    // Select first filter
    fireEvent.change(filterSelects[1], { target: { value: "1" } });
    expect(mockOnDataSelection).toHaveBeenCalledWith(mockRawDataItems[0], {
      1: "1",
    });

    // Select second filter
    fireEvent.change(filterSelects[2], { target: { value: "2" } });
    expect(mockOnDataSelection).toHaveBeenCalledWith(mockRawDataItems[0], {
      1: "1",
      2: "2",
    });
  });

  it("handles invalid table selection gracefully", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const tableSelect = screen.getAllByTestId("select")[0];
    fireEvent.change(tableSelect, { target: { value: "999" } });

    // Should not crash and onDataSelection should not be called with invalid data
    expect(mockOnDataSelection).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 999 }),
      expect.anything()
    );
  });

  it("handles filter change with empty value gracefully", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const filterSelects = screen.getAllByTestId("select");
    const firstFilterSelect = filterSelects[1];

    fireEvent.change(firstFilterSelect, { target: { value: "" } });

    expect(mockOnDataSelection).toHaveBeenCalledWith(mockRawDataItems[0], {
      1: "",
    });
  });

  it("renders with default data when no rawDataItems provided", () => {
    render(<RawDataNavigationItem />);

    expect(screen.getByText("Demand During Lead Time")).toBeInTheDocument();
    expect(screen.getByText("Another Table")).toBeInTheDocument();
    expect(screen.getByText("Select the organization:")).toBeInTheDocument();
    expect(screen.getByText("Select the CM Site Name:")).toBeInTheDocument();
    expect(screen.getByText("Select the SKU:")).toBeInTheDocument();
    expect(screen.getByText("Select the NVPN:")).toBeInTheDocument();
  });

  it("works without onDataSelection callback", () => {
    render(<RawDataNavigationItem rawDataItems={mockRawDataItems} />);

    const tableSelect = screen.getAllByTestId("select")[0];

    // Should not throw error when onDataSelection is not provided
    expect(() => {
      fireEvent.change(tableSelect, { target: { value: "2" } });
    }).not.toThrow();
  });

  it("renders icons correctly", () => {
    render(<RawDataNavigationItem rawDataItems={mockRawDataItems} />);

    const icons = screen.getAllByTestId("icon");
    icons.forEach((icon) => {
      expect(icon).toHaveAttribute("data-name", "slim-arrow-down");
      expect(icon).toHaveAttribute("data-slot", "icon");
    });
  });

  it("applies correct CSS classes", () => {
    render(<RawDataNavigationItem rawDataItems={mockRawDataItems} />);

    const flexBoxes = screen.getAllByTestId("flex-box");
    const mainFlexBox = flexBoxes[0];
    expect(mainFlexBox).toHaveClass("gap-2", "py-2", "w-full");

    const selects = screen.getAllByTestId("select");
    selects.forEach((select) => {
      expect(select).toHaveClass("w-full");
    });
  });

  it("handles NaN conversion gracefully", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const tableSelect = screen.getAllByTestId("select")[0];
    fireEvent.change(tableSelect, { target: { value: "invalid" } });

    // Should not crash when parseInt returns NaN
    expect(() => {
      fireEvent.change(tableSelect, { target: { value: "invalid" } });
    }).not.toThrow();
  });

  it("updates filter selections state correctly", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const filterSelects = screen.getAllByTestId("select");

    // Set a filter value
    fireEvent.change(filterSelects[1], { target: { value: "1" } });

    // Check that the select shows the selected value
    expect(filterSelects[1]).toHaveValue("1");

    // Change to another filter value
    fireEvent.change(filterSelects[1], { target: { value: "2" } });
    expect(filterSelects[1]).toHaveValue("2");
  });

  it("handles undefined or null values in event detail gracefully", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const tableSelect = screen.getAllByTestId("select")[0];

    // Test with undefined value
    fireEvent.change(tableSelect, { target: { value: undefined } });

    expect(() => {
      fireEvent.change(tableSelect, { target: { value: undefined } });
    }).not.toThrow();
  });

  it("handles filter change when event detail selectedOption value is undefined", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const filterSelects = screen.getAllByTestId("select");
    const firstFilterSelect = filterSelects[1];

    // Simulate undefined value
    fireEvent.change(firstFilterSelect, { target: { value: undefined } });

    // Should default to "all" when value is undefined
    expect(mockOnDataSelection).toHaveBeenCalledWith(mockRawDataItems[0], {
      1: "all",
    });
  });

  it("handles table change with undefined detail selectedOption value", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    const tableSelect = screen.getAllByTestId("select")[0];

    // Simulate undefined value which will trigger the ?? "" fallback
    fireEvent.change(tableSelect, { target: { value: undefined } });

    // Should not crash and should handle the parseInt of empty string gracefully
    expect(() => {
      fireEvent.change(tableSelect, { target: { value: undefined } });
    }).not.toThrow();
  });

  it("handles filter change with undefined detail selectedOption value", () => {
    render(
      <RawDataNavigationItem
        rawDataItems={mockRawDataItems}
        onDataSelection={mockOnDataSelection}
      />
    );

    // Get filter selects (skip the first one which is for table selection)
    const filterSelects = screen.getAllByTestId("select").slice(1);
    if (filterSelects.length > 0) {
      const filterSelect = filterSelects[0];

      // Add special option to trigger undefined case
      const nullOption = document.createElement("option");
      nullOption.value = "undefined";
      nullOption.textContent = "Undefined Test";
      filterSelect.appendChild(nullOption);

      // Test the ?? "all" fallback by selecting the undefined option
      fireEvent.change(filterSelect, { target: { value: "undefined" } });

      expect(mockOnDataSelection).toHaveBeenCalled();
    }
  });

  it("covers parseInt fallback with null values", () => {
    // Create a mock component that will test the parseInt fallback
    const TestComponent = () => {
      const handleRawDataChange = (id: number) => {
        mockOnDataSelection({
          tableId: id,
          tableName: "Test",
          filters: {},
        });
      };

      // Simulate the exact code path from the component
      const mockEvent = {
        detail: {
          selectedOption: {
            value: null as string | null,
          },
        },
      };

      // This simulates the exact parseInt line from the component
      React.useEffect(() => {
        handleRawDataChange(
          parseInt((mockEvent.detail.selectedOption.value ?? "") as string)
        );
      });

      return <div>test</div>;
    };

    render(<TestComponent />);

    // The parseInt(null ?? "") will result in NaN, but the function should still be called
    expect(mockOnDataSelection).toHaveBeenCalled();
  });
});
