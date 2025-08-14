import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ChartPage from '@/app/(fullscreen)/full-screen/chart/[id]/page';
import { Title } from '@ui5/webcomponents-react';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'xyz' }),
}));

jest.mock('@/components/AICharts/AIChartContainer', () => ({
  AIChartContainer: ({
    chartId,
    isFullscreen,
    onTitleChange,
  }: {
    chartId: string;
    isFullscreen: boolean;
    onTitleChange?: (title: string) => void;
  }) => (
    <div
      data-testid="ai-chart-container"
      data-id={chartId}
      data-full={String(isFullscreen)}
      data-on-title-change={
        typeof onTitleChange === 'function' ? 'true' : 'false'
      }
    />
  ),
}));

describe('fullscreen chart page', () => {
  it('renders title area and passes id to AIChartContainer', () => {
    render(<ChartPage />);
    expect(screen.getByText('Here is the full chart')).toBeInTheDocument();
    const c = screen.getByTestId('ai-chart-container');
    expect(c).toHaveAttribute('data-id', 'xyz');
    expect(c).toHaveAttribute('data-full', 'true');
  });

  it('updates title when onTitleChange is called', () => {
    const TestComponent = () => {
      const [title, setTitle] = useState('');
      return (
        <>
          <Title level="H2">{title}</Title>
          <button onClick={() => setTitle('New Title')}>Update</button>
        </>
      );
    };

    render(<TestComponent />);
    expect(screen.queryByText('New Title')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Update'));
    expect(screen.getByText('New Title')).toBeInTheDocument();
  });
});
