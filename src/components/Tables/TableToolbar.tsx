"use client";

import React from "react";
import {
  Toolbar,
  Title,
  ToolbarSpacer,
  ToolbarSeparator,
  ToolbarButton,
  Input,
  Icon,
  FlexBox,
} from "@ui5/webcomponents-react";

interface TableToolbarProps {
  className?: string;
  title?: string;
}

const TableToolbar: React.FC<Readonly<TableToolbarProps>> = ({
  className,
  title = "Final Summary",
}) => {
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
      />
      <ToolbarButton design="Transparent" icon="action" />
      <ToolbarSeparator />
      <ToolbarButton design="Transparent" icon="action-settings" />
      <ToolbarSeparator />
      <ToolbarButton design="Transparent" icon="excel-attachment" />
      <ToolbarSeparator />
      <ToolbarButton design="Transparent" icon="full-screen" />
    </Toolbar>
  );
};

export default TableToolbar;
