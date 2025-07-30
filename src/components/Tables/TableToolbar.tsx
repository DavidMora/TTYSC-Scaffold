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
} from "@ui5/webcomponents-react";

interface TableToolbarProps {
  className?: string;
  title?: string;
}

const TableToolbar: React.FC<Readonly<TableToolbarProps>> = ({
  className,
  title = "Final Summary",
}) => {
  const [search, setSearch] = useState("");

  const handleSearch = (event: Ui5CustomEvent<InputDomRef, never>) => {
    setSearch(event.target.value);
  };

  const handleShare = () => {
    console.log("share");
  };

  const handleExport = () => {
    console.log("export");
  };

  const handleSettings = () => {
    console.log("settings");
  };

  const handleFullScreen = () => {
    console.log("full screen");
  };

  return (
    <Toolbar
      className={className}
      style={{
        borderBottom: "1px solid var(--sapList_HeaderBorderColor)",
        paddingInline: "0.75rem",
      }}
    >
      <Title level="H2">{title}</Title>
      <ToolbarSpacer />
      <Input
        icon={
          <FlexBox>
            <Icon name="search" />
          </FlexBox>
        }
        type="Text"
        placeholder="Search..."
        valueState="None"
        value={search}
        onChange={handleSearch}
      />
      <ToolbarButton design="Transparent" icon="action" onClick={handleShare} />
      <ToolbarSeparator />
      <ToolbarButton
        design="Transparent"
        icon="action-settings"
        onClick={handleSettings}
      />
      <ToolbarSeparator />
      <ToolbarButton
        design="Transparent"
        icon="excel-attachment"
        onClick={handleExport}
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
