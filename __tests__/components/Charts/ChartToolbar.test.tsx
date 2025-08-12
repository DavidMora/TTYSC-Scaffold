import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChartToolbar } from "@/components/Charts/ChartToolbar";

// UI5 webcomponents-react renders to native elements in tests; interactions are synthetic

describe("ChartToolbar", () => {
  it("renders zoom buttons and calls handlers with disabled states", () => {
    const onIn = jest.fn();
    const onOut = jest.fn();
    render(
      <ChartToolbar
        showZoom
        onZoomIn={onIn}
        onZoomOut={onOut}
        disableZoomIn
        disableZoomOut
      />
    );

    const zoomIn = screen.getByLabelText("Zoom In");
    const zoomOut = screen.getByLabelText("Zoom Out");
    expect(zoomIn).toBeDisabled();
    expect(zoomOut).toBeDisabled();

    // Re-render enabled
    render(<ChartToolbar showZoom onZoomIn={onIn} onZoomOut={onOut} />);
    // Multiple toolbars may exist due to previous render; choose the last enabled one
    const zoomInButtons = screen.getAllByLabelText("Zoom In");
    const zoomOutButtons = screen.getAllByLabelText("Zoom Out");
    fireEvent.click(zoomInButtons[zoomInButtons.length - 1]);
    fireEvent.click(zoomOutButtons[zoomOutButtons.length - 1]);
    expect(onIn).toHaveBeenCalled();
    expect(onOut).toHaveBeenCalled();
  });

  it("handles filter changes (date range and region)", () => {
    const onDate = jest.fn();
    const onRegion = jest.fn();
    render(
      <ChartToolbar
        showFilters
        onDateRangeChange={(from, to) => onDate(`${from}|${to}`)}
        onRegionChange={onRegion}
      />
    );

    const datePicker = screen.getByPlaceholderText("Select date range");
    fireEvent.change(datePicker, { target: { value: "2024-01-01 - 2024-06-30" } });
    expect(onDate).toHaveBeenCalledWith("2024-01-01|2024-06-30");

    const region =
      screen.getByText("Region").closest("ui5-select") ||
      screen.getByText("Region").parentElement!;
    // Simulate changing the select value; underlying mock forwards .value
    fireEvent.change(region, { target: { value: "north" } });
    expect(onRegion).toHaveBeenCalledWith("north");
  });

  it("supports controlled dateRange and region values without updating internal state", () => {
    const onDate = jest.fn();
    const onRegion = jest.fn();
    render(
      <ChartToolbar
        showFilters
        dateRange="2024-03-01 - 2024-03-31"
        region="east"
        onDateRangeChange={onDate}
        onRegionChange={onRegion}
      />
    );

    // When controlled, changing should still invoke callbacks but component keeps given values
    const datePicker = screen.getByPlaceholderText("Select date range");
    fireEvent.change(datePicker, { target: { value: "2024-04-01 - 2024-04-30" } });
    expect(onDate).toHaveBeenCalled();

    const regionSelect =
      screen.getByText("Region").closest("ui5-select") ||
      screen.getByText("Region").parentElement!;
    fireEvent.change(regionSelect, { target: { value: "west" } });
    expect(onRegion).toHaveBeenCalledWith("west");
  });

  it("opens download menu and triggers options when onDownloadOption is provided", () => {
    const onOpt = jest.fn();
    render(<ChartToolbar showDownload onDownloadOption={onOpt} />);

    const btn = screen.getByTitle("Download");
    fireEvent.click(btn);
    // menu should be rendered with options
    fireEvent.click(screen.getByText("Download PNG"));
    expect(onOpt).toHaveBeenCalledWith("png");
    // Also trigger CSV to cover the other branch
    fireEvent.click(btn);
    fireEvent.click(screen.getByText("Download CSV"));
    expect(onOpt).toHaveBeenCalledWith("csv");
  });

  it("invokes onFullScreenClick when full screen button is enabled", () => {
    const onFull = jest.fn();
    render(<ChartToolbar showFullScreen onFullScreenClick={onFull} />);
    const fullBtn = screen.getByTitle("Full Screen");
    fireEvent.click(fullBtn);
    expect(onFull).toHaveBeenCalled();
  });

  it("calls onDownloadClick when no onDownloadOption is provided", () => {
    const onDownloadClick = jest.fn();
    const onDownloadOption = jest.fn();
    // Ensure only onDownloadClick path is taken
    render(<ChartToolbar showDownload onDownloadClick={onDownloadClick} />);

    const btn = screen.getByTitle("Download");
    fireEvent.click(btn);
    expect(onDownloadClick).toHaveBeenCalled();
    // Menu items should not be present when using onDownloadClick
    expect(screen.queryByText("Download PNG")).toBeNull();
    expect(screen.queryByText("Download CSV")).toBeNull();
    expect(onDownloadOption).not.toHaveBeenCalled();
  });

  it("renders leftContent and can hide filters and zoom controls", () => {
    render(
      <ChartToolbar
        leftContent={<div data-testid="left-content">Extra</div>}
        showFilters={false}
        showZoom={false}
      />
    );

    expect(screen.getByTestId("left-content")).toBeInTheDocument();
    // Filters hidden
    expect(screen.queryByPlaceholderText("Select date")).toBeNull();
    expect(screen.queryByText("Region")).toBeNull();
    // Zoom buttons hidden
    expect(screen.queryByLabelText("Zoom In")).toBeNull();
    expect(screen.queryByLabelText("Zoom Out")).toBeNull();
  });

  it("disables full screen button when showFullScreen is false and does not call handler", () => {
    const onFull = jest.fn();
    render(<ChartToolbar showFullScreen={false} onFullScreenClick={onFull} />);
    const fullBtn = screen.getByTitle("Full Screen");
    expect(fullBtn).toBeDisabled();
    fireEvent.click(fullBtn);
    expect(onFull).not.toHaveBeenCalled();
  });
});
