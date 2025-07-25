import {
  SideNavigationItem,
  FlexBox,
  FlexBoxDirection,
  Text,
  Select,
  Option,
  Label,
  Card,
  CardHeader,
} from "@ui5/webcomponents-react";
import { useState } from "react";

export interface FilterValue {
  id: number;
  text: string;
}

export interface TableFilter {
  id: number;
  text: string;
  values: FilterValue[];
}

export interface RawDataItem {
  id: number;
  tableName: string;
  tableFilters: TableFilter[];
}

interface RawDataNavigationItemProps {
  rawDataItems?: RawDataItem[];
  onDataSelection?: (
    selectedData: RawDataItem,
    filters: Record<number, string>
  ) => void;
}

const defaultRawDataItems: RawDataItem[] = [
  {
    id: 1,
    tableName: "Demand During Lead Time",
    tableFilters: [
      {
        id: 1,
        text: "Select the organization:",
        values: [
          { id: 1, text: "Organization 1" },
          { id: 2, text: "Organization 2" },
          { id: 3, text: "Organization 3" },
        ],
      },
      {
        id: 2,
        text: "Select the CM Site Name:",
        values: [
          { id: 1, text: "CM Site 1" },
          { id: 2, text: "CM Site 2" },
          { id: 3, text: "CM Site 3" },
        ],
      },
      {
        id: 3,
        text: "Select the SKU:",
        values: [
          { id: 1, text: "SKU 1" },
          { id: 2, text: "SKU 2" },
          { id: 3, text: "SKU 3" },
        ],
      },
      {
        id: 4,
        text: "Select the NVPN:",
        values: [
          { id: 1, text: "NVPN 1" },
          { id: 2, text: "NVPN 2" },
          { id: 3, text: "NVPN 3" },
        ],
      },
    ],
  },
  {
    id: 2,
    tableName: "Another Table",
    tableFilters: [
      {
        id: 1,
        text: "Sub Item 1",
        values: [
          { id: 1, text: "Value 1" },
          { id: 2, text: "Value 2" },
        ],
      },
      {
        id: 2,
        text: "Sub Item 2",
        values: [
          { id: 1, text: "Value 1" },
          { id: 2, text: "Value 2" },
        ],
      },
    ],
  },
];

export default function RawDataNavigationItem({
  rawDataItems = defaultRawDataItems,
  onDataSelection,
}: Readonly<RawDataNavigationItemProps>) {
  const [selectedRawData, setSelectedRawData] = useState<RawDataItem | null>(
    rawDataItems.length > 0 ? rawDataItems[0] : null
  );
  const [filterSelections, setFilterSelections] = useState<
    Record<number, string>
  >({});

  const handleRawDataChange = (id: number) => {
    const selected = rawDataItems.find((item) => item.id === id);
    if (selected) {
      setSelectedRawData(selected);
      setFilterSelections({}); // Reset filter selections when changing table
      onDataSelection?.(selected, {});
    }
  };

  const handleFilterChange = (filterId: number, value: string) => {
    if (!selectedRawData) return;

    const newFilterSelections = { ...filterSelections, [filterId]: value };
    setFilterSelections(newFilterSelections);
    onDataSelection?.(selectedRawData, newFilterSelections);
  };

  if (!selectedRawData) {
    return (
      <SideNavigationItem text="Raw Data" icon="it-host" unselectable>
        <Text>No data available</Text>
      </SideNavigationItem>
    );
  }

  return (
    <SideNavigationItem text="Raw Data" icon="it-host" unselectable>
      <FlexBox
        direction={FlexBoxDirection.Column}
        className="gap-2 py-2 w-full"
      >
        <Text>Select a table to explore</Text>
        <Select
          className="w-full"
          value={selectedRawData.id.toString()}
          onChange={(event) => {
            const value = event.detail.selectedOption.value;
            const id = parseInt(value ?? "");
            handleRawDataChange(id);
          }}
        >
          {rawDataItems.map((item) => (
            <Option key={item.id} value={item.id.toString()}>
              {item.tableName}
            </Option>
          ))}
        </Select>
        <Text>
          Showing data from {selectedRawData.tableName} (Top 100 rows):
        </Text>
        {selectedRawData.tableFilters.map((filter) => (
          <FlexBox
            key={filter.id}
            direction={FlexBoxDirection.Column}
            className="gap-0 mb-2 w-full"
          >
            <Label>{filter.text}</Label>
            <Select
              className="w-full"
              value={filterSelections[filter.id] || "all"}
              onChange={(event) =>
                handleFilterChange(
                  filter.id,
                  event.detail.selectedOption.value ?? "all"
                )
              }
            >
              <Option value="all">All</Option>
              {filter.values.map((value) => (
                <Option key={value.id} value={value.id.toString()}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </FlexBox>
        ))}
        <Card
          className="w-full"
          header={
            <CardHeader
              additionalText="view"
              titleText="Demand During Lead Time"
              subtitleText="Here you can expand the table for you to see the full display of it "
            />
          }
        >
          {/* <Text>Card Content</Text> */}
        </Card>
      </FlexBox>
    </SideNavigationItem>
  );
}
