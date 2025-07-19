import React from "react";
import {
  Text,
  Select,
  Option,
  FlexBox,
  FlexBoxDirection,
  FlexBoxWrap,
} from "@ui5/webcomponents-react";
import { FILTER_CONFIGS } from "@/lib/constants/UI/analysisFilters";
import { FilterKeyType } from "@/lib/types/cases";

const FilterSelect: React.FC<{
  filterKey: FilterKeyType;
  label: string;
  value: string;
  options: string[];
  disabled: boolean;
  onChange: (key: FilterKeyType, value: string) => void;
}> = ({ filterKey, label, value, options, disabled, onChange }) => (
  <FlexBox
    direction={FlexBoxDirection.Column}
    style={{ minWidth: "180px", flex: "1", gap: "0.25rem" }}
  >
    <Text
      style={{
        fontSize: "var(--sapFontSize)",
        color: "var(--sapContent_LabelColor)",
      }}
    >
      {label}
    </Text>
    <Select
      value={value}
      onChange={(e) => {
        const selectedValue = e.detail.selectedOption?.value;
        if (selectedValue) onChange(filterKey, selectedValue);
      }}
      style={{ width: "100%" }}
      disabled={disabled}
    >
      {options.map((option) => (
        <Option key={option} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  </FlexBox>
);


const AnalysisFilter: React.FC<{
  filters: FilterState;
  availableOptions: FilterOptions;
  isDisabled: (filterKey: FilterKey) => boolean;
  handleFilterChange: (filterKey: FilterKey, value: string) => void;
}> = ({ filters, availableOptions, isDisabled, handleFilterChange }) => {
  return (
    <div>
      <Text
        style={{
          fontSize: "var(--sapFontSize)",
          marginBottom: "0.5rem",
          display: "block",
          fontWeight: "bold",
        }}
      >
        Click to view the data, choose your filters, and select the use cases to
        continue.
      </Text>

      <FlexBox wrap={FlexBoxWrap.Wrap} style={{ gap: "1rem" }}>
        {FILTER_CONFIGS.map(({ key, name }) => (
          <FilterSelect
            key={key}
            filterKey={key}
            label={name}
            value={filters[key]}
            options={availableOptions[key]}
            disabled={isDisabled(key)}
            onChange={handleFilterChange}
          />
        ))}
      </FlexBox>
    </div>
  );
};

export default AnalysisFilter;
