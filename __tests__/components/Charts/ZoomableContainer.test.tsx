import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ZoomableContainer } from '@/components/Charts/ZoomableContainer';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

// Mock chartExport utils to observe calls
jest.mock('@/lib/utils/chartExport', () => ({
  downloadChartAsPng: jest.fn(),
  getCurrentSlice: jest.fn((d: any[]) => d),
  buildCsv: jest.fn(() => 'name,Value\nA,1'),
  triggerFileDownload: jest.fn(),
  sanitizeFilename: jest.fn((s: string) => s),
}));

describe('ZoomableContainer', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as unknown as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders toolbar with title and handles zoom buttons (visual mode)', () => {
    render(
      <ZoomableContainer title="My Chart" dataLength={10}>
        <div>chart</div>
      </ZoomableContainer>
    );

    expect(screen.getByText('My Chart')).toBeInTheDocument();
    const zoomIn = screen.getByLabelText('Zoom In');
    const zoomOut = screen.getByLabelText('Zoom Out');
    fireEvent.click(zoomIn);
    fireEvent.click(zoomOut);
  });

  it('navigates to fullscreen when button clicked and id provided', () => {
    render(
      <ZoomableContainer title="T" chartIdForFullscreen="abc123">
        <div>chart</div>
      </ZoomableContainer>
    );

    const full = screen.getByTitle('Full Screen');
    fireEvent.click(full);
    expect(mockPush).toHaveBeenCalledWith('/full-screen/chart/abc123');
  });

  it('triggers PNG and CSV downloads via menu', () => {
    const { downloadChartAsPng, triggerFileDownload } = jest.requireMock(
      '@/lib/utils/chartExport'
    );

    const dataset = [{ name: 'A', value: 1 }];
    const dimensions = [{ accessor: 'name' }];
    const measures = [
      {
        accessor: 'value',
        label: 'Value',
        formatter: (n: number) => String(n),
        axis: 'y',
      },
    ];

    render(
      <ZoomableContainer
        title="Export Title"
        exportContext={{ dataset, dimensions, measures }}
      >
        <svg role="img" />
      </ZoomableContainer>
    );

    const btn = screen.getByTitle('Download');
    fireEvent.click(btn);
    fireEvent.click(screen.getByText('Download PNG'));
    expect(downloadChartAsPng).toHaveBeenCalled();

    // Open again for CSV
    fireEvent.click(btn);
    fireEvent.click(screen.getByText('Download CSV'));
    expect(triggerFileDownload).toHaveBeenCalled();
  });
});
