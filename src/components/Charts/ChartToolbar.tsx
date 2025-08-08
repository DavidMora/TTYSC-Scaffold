"use client";

import React from "react";
import { Toolbar, ToolbarSpacer, Button } from "@ui5/webcomponents-react";

interface ChartToolbarProps {
  leftContent?: React.ReactNode;
  className?: string;
  // Zoom actions
  showZoom?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  disableZoomIn?: boolean;
  disableZoomOut?: boolean;
  // Optional actions
  showSearch?: boolean;
  onSearchClick?: () => void;
  showDownload?: boolean;
  onDownloadClick?: () => void;
  showFullScreen?: boolean;
  onFullScreenClick?: () => void;
}

export const ChartToolbar: React.FC<Readonly<ChartToolbarProps>> = ({
  leftContent,
  className,
  showZoom = true,
  onZoomIn,
  onZoomOut,
  disableZoomIn,
  disableZoomOut,
  showSearch = false,
  onSearchClick,
  showDownload = false,
  onDownloadClick,
  showFullScreen = false,
  onFullScreenClick,
}) => {
  return (
    <Toolbar className={className} style={{ padding: 0 }}>
      {leftContent}
      <ToolbarSpacer />
      {showZoom && (
        <>
          <Button
            icon="zoom-in"
            design="Emphasized"
            onClick={onZoomIn}
            disabled={disableZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
          />
          <Button
            icon="zoom-out"
            onClick={onZoomOut}
            disabled={disableZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
          />
        </>
      )}
      {showSearch && (
        <Button icon="search" onClick={onSearchClick} title="Search" />
      )}
      {showDownload && (
        <Button icon="download" onClick={onDownloadClick} title="Download" />
      )}
      {showFullScreen && (
        <Button
          icon="full-screen"
          onClick={onFullScreenClick}
          title="Full Screen"
        />
      )}
    </Toolbar>
  );
};

export default ChartToolbar;


