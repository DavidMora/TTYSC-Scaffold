"use client";

import React, { useState } from "react";
import {
  Toolbar,
  Title,
  ToolbarSpacer,
  ToolbarSeparator,
  ToolbarButton,
  Input,
  Icon,
  FlexBox,
  Ui5CustomEvent,
  InputDomRef,
  Select,
  DatePicker,
  Option,
} from "@ui5/webcomponents-react";
import { ExportMenu } from "@/components/ExportMenu";
import { Filter, TableToolbarProps } from "@/lib/types/datatable";

const TableToolbar: React.FC<Readonly<TableToolbarProps>> = ({
  className,
  title = "Final Summary",
  tableId,
  filters = [],
  onFilterChange,
}) => {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    () => {
      // Inicializar valores de filtros con los valores por defecto
      const initialValues: Record<string, string> = {};
      filters.forEach((filter) => {
        if (filter.value) {
          initialValues[filter.key] = filter.value;
        }
      });
      return initialValues;
    }
  );

  const handleSearch = (event: Ui5CustomEvent<InputDomRef, never>) => {
    setSearch(event.target.value);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));

    if (onFilterChange) {
      onFilterChange({ filterKey, value });
    }
  };

  const handleSelectChange =
    (filterKey: string) =>
    (
      event: Ui5CustomEvent<
        HTMLElement,
        { selectedOption?: { value?: string } }
      >
    ) => {
      const value = event.detail.selectedOption?.value || "";
      handleFilterChange(filterKey, value);
    };

  const handleDateChange =
    (filterKey: string) =>
    (event: Ui5CustomEvent<HTMLElement, { value?: string }>) => {
      const value = event.detail.value || "";
      handleFilterChange(filterKey, value);
    };

  const renderFilter = (filter: Filter) => {
    const currentValue = filterValues[filter.key] || "";

    if (filter.type === "select") {
      return (
        <Select
          key={filter.key}
          onChange={handleSelectChange(filter.key)}
          valueState="None"
          value={currentValue}
        >
          {filter.placeholder && <Option value="">{filter.placeholder}</Option>}
          {filter.options.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.text}
            </Option>
          ))}
        </Select>
      );
    }

    if (filter.type === "date") {
      return (
        <DatePicker
          key={filter.key}
          onChange={handleDateChange(filter.key)}
          primaryCalendarType="Gregorian"
          valueState="None"
          value={currentValue}
          placeholder={filter.placeholder}
        />
      );
    }

    return null;
  };

  const handleShare = () => {
    console.log("share");
  };

  const handleSettings = () => {
    console.log("settings");
  };

  const handleFullScreen = () => {
    console.log("full screen");
  };

  return (
    <Toolbar alignContent="Start" className={className}>
      <Title level="H2">{title}</Title>
      {filters.map((filter) => renderFilter(filter))}
      <ToolbarSpacer />
      <Input
        icon={
          <FlexBox>
            <Icon name="search" />
          </FlexBox>
        }
        value={search}
        onChange={handleSearch}
        onClose={function Xs() {}}
        onInput={function Xs() {}}
        onOpen={function Xs() {}}
        onSelect={function Xs() {}}
        onSelectionChange={function Xs() {}}
        type="Text"
        placeholder="Search..."
        valueState="None"
      />
      <ToolbarSeparator />
      <ToolbarButton design="Transparent" icon="action" onClick={handleShare} />
      <ToolbarSeparator />
      <ToolbarButton
        design="Transparent"
        icon="action-settings"
        onClick={handleSettings}
      />
      <ToolbarSeparator />
      <ExportMenu
        tableId={tableId || 1}
        buttonText="Export"
        buttonIcon="excel-attachment"
      />
      <ToolbarSeparator />
      <ToolbarButton
        design="Transparent"
        icon="full-screen"
        onClick={handleFullScreen}
      />
    </Toolbar>
  );
};

export default TableToolbar;
