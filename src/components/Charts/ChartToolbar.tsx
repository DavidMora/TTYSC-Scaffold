"use client";

import React, { useRef, useState } from "react";
import {
  Toolbar,
  ToolbarSpacer,
  Button,
  Select,
  DatePicker,
  Option,
  Ui5CustomEvent,
  Menu,
  MenuItem,
} from "@ui5/webcomponents-react";
import type { ButtonDomRef } from "@ui5/webcomponents-react";

interface ChartToolbarProps {
  leftContent?: React.ReactNode;
  // Zoom actions
  showZoom?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  disableZoomIn?: boolean;
  disableZoomOut?: boolean;
  // Optional actions
  showDownload?: boolean;
  onDownloadClick?: () => void; // deprecated in favor of onDownloadOption
  onDownloadOption?: (type: "png" | "csv") => void;
  showFullScreen?: boolean;
  onFullScreenClick?: () => void;
  // Filter actions
  showFilters?: boolean;
  onDateChange?: (date: string) => void;
  onRegionChange?: (region: string) => void;
}

export const ChartToolbar: React.FC<Readonly<ChartToolbarProps>> = ({
  leftContent,
  showZoom = true,
  onZoomIn,
  onZoomOut,
  disableZoomIn,
  disableZoomOut,
  showDownload = false,
  onDownloadClick,
  onDownloadOption,
  showFullScreen = false,
  onFullScreenClick,
  showFilters = true,
  onDateChange,
  onRegionChange,
}) => {
  const [selectedDate, setSelectedDate] = useState("2023-07-04");
  const [selectedRegion, setSelectedRegion] = useState("");
  const downloadBtnRef = useRef<ButtonDomRef | null>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  const handleDateChange = (
    event: Ui5CustomEvent<HTMLElement, { value?: string }>
  ) => {
    const value = event.detail.value || "";
    setSelectedDate(value);
    onDateChange?.(value);
  };

  const handleRegionChange = (
    event: Ui5CustomEvent<HTMLElement, { selectedOption?: { value?: string } }>
  ) => {
    const value = event.detail.selectedOption?.value || "";
    setSelectedRegion(value);
    onRegionChange?.(value);
  };

  return (
    <Toolbar style={{ border: "none", borderRadius: "10px 10px 0 0" }}>
      {leftContent}
      <ToolbarSpacer />
      {showFilters && (
        <>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            primaryCalendarType="Gregorian"
            valueState="None"
            placeholder="Select date"
            style={{
              marginRight: "8px",
              width: "140px",
            }}
          />
          <Select
            value={selectedRegion}
            onChange={handleRegionChange}
            valueState="None"
            style={{
              marginRight: "8px",
              width: "120px",
            }}
          >
            <Option value="">Region</Option>
            <Option value="north">North</Option>
            <Option value="south">South</Option>
            <Option value="east">East</Option>
            <Option value="west">West</Option>
          </Select>
        </>
      )}
      {showZoom && (
        <>
          <Button
            icon="zoom-in"
            design="Transparent"
            onClick={onZoomIn}
            disabled={disableZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
          />
          <Button
            icon="zoom-out"
            design="Transparent"
            onClick={onZoomOut}
            disabled={disableZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
          />
        </>
      )}
      {showDownload && (
        <>
          <Button
            icon="download"
            design="Transparent"
            onClick={() => {
              if (onDownloadOption) {
                setDownloadMenuOpen(true);
              } else {
                onDownloadClick?.();
              }
            }}
            title="Download"
            ref={downloadBtnRef}
          />
          {onDownloadOption && (
            <Menu
              opener={downloadBtnRef.current ?? undefined}
              open={downloadMenuOpen}
              onClose={() => setDownloadMenuOpen(false)}
              horizontalAlign="End"
           >
              <MenuItem
                icon="image-viewer"
                text="Download PNG"
                onClick={() => {
                  setDownloadMenuOpen(false);
                  onDownloadOption("png");
                }}
              />
              <MenuItem
                icon="excel-attachment"
                text="Download CSV"
                onClick={() => {
                  setDownloadMenuOpen(false);
                  onDownloadOption("csv");
                }}
              />
            </Menu>
          )}
        </>
      )}
      {showFullScreen && (
        <Button
          icon="full-screen"
          design="Transparent"
          onClick={onFullScreenClick}
          title="Full Screen"
        />
      )}
    </Toolbar>
  );
};

export default ChartToolbar;
