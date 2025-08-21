import { metadataToAIChartData } from '@/lib/metadata/chart';
import { ExecutionMetadata } from '@/lib/types/chats';
import { CHART_TYPE, ChartSeries } from '@/lib/types/charts';

describe('metadataToAIChartData', () => {
  const baseMetadata: ExecutionMetadata = {
    original_query: 'test query',
    final_query: 'test query',
    execution_plan: {
      complexity: 'simple',
      entities_referenced: {},
      data_sources_needed: [],
      reasoning: 'test',
      steps: [],
      parallel_steps: [],
    },
    selected_data_source: 'test',
    entity_validation: {
      valid: [],
      inferred: {},
    },
    generated_sql: 'SELECT * FROM test',
    query_results: {
      success: true,
      limited_to: -1,
      truncated: false,
      columns: ['col1', 'col2'],
      dataframe_records: [],
    },
    completed_steps: [],
    error: null,
    generated_chart: {
      Series: [
        {
          name: 'Test Series',
          data: [
            { x: 'Jan', y: 100 },
            { x: 'Feb', y: 200 },
            { x: 'Mar', y: 150 },
          ],
        },
      ],
      XAxisKey: 'x',
      YAxisKey: 'y',
    },
    chart_label: 'Test Chart Label',
    chart_type: 'column',
  };

  beforeEach(() => {
    // Mock the current date to ensure consistent timestamps
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when metadata is null', () => {
    const result = metadataToAIChartData(null);
    expect(result).toBeNull();
  });

  it('returns null when metadata is undefined', () => {
    const result = metadataToAIChartData(undefined);
    expect(result).toBeNull();
  });

  it('returns null when generated_chart is missing', () => {
    const metadata = { ...baseMetadata };
    delete metadata.generated_chart;

    const result = metadataToAIChartData(metadata);
    expect(result).toBeNull();
  });

  it('returns null when Series is not an array', () => {
    const metadata: ExecutionMetadata = {
      ...baseMetadata,
      generated_chart: {
        Series: 'not an array' as unknown as Array<{
          name: string;
          data: Array<{ x: string | number; y: number }>;
        }>,
        XAxisKey: 'x',
        YAxisKey: 'y',
      },
    };

    const result = metadataToAIChartData(metadata);
    expect(result).toBeNull();
  });

  it('returns null when Series is empty array', () => {
    const metadata: ExecutionMetadata = {
      ...baseMetadata,
      generated_chart: {
        Series: [],
        XAxisKey: 'x',
        YAxisKey: 'y',
      },
    };

    const result = metadataToAIChartData(metadata);
    expect(result).toBeNull();
  });

  it('converts valid metadata to AIChartData with column chart type', () => {
    const result = metadataToAIChartData(baseMetadata);

    expect(result).toEqual({
      timestamp: '2024-01-01T00:00:00.000Z',
      label: 'Test Chart Label',
      chart: {
        type: CHART_TYPE.column,
        labels: ['Jan', 'Feb', 'Mar'],
        data: [
          {
            name: 'Test Series',
            data: [100, 200, 150],
          },
        ],
      },
    });
  });

  it('uses default chart label when chart_label is missing', () => {
    const metadata = { ...baseMetadata };
    delete metadata.chart_label;

    const result = metadataToAIChartData(metadata);

    expect(result?.label).toBe('Chart');
  });

  it('uses default series name when series name is missing', () => {
    const metadata: ExecutionMetadata = {
      ...baseMetadata,
      generated_chart: {
        Series: [
          {
            name: '',
            data: [
              { x: 'Jan', y: 100 },
              { x: 'Feb', y: 200 },
            ],
          },
        ],
        XAxisKey: 'x',
        YAxisKey: 'y',
      },
    };

    const result = metadataToAIChartData(metadata);

    expect((result?.chart.data as ChartSeries[])[0].name).toBe('Series');
  });

  it('uses default column chart type when chart_type is invalid', () => {
    const metadata: ExecutionMetadata = {
      ...baseMetadata,
      chart_type: 'invalid_chart_type',
    };

    const result = metadataToAIChartData(metadata);

    expect(result?.chart.type).toBe(CHART_TYPE.column);
  });

  it('maps valid chart types correctly', () => {
    const metadata: ExecutionMetadata = {
      ...baseMetadata,
      chart_type: 'bar',
    };

    const result = metadataToAIChartData(metadata);

    expect(result?.chart.type).toBe(CHART_TYPE.bar);
  });

  it('handles empty data arrays gracefully', () => {
    const metadata: ExecutionMetadata = {
      ...baseMetadata,
      generated_chart: {
        Series: [
          {
            name: 'Empty Series',
            data: [],
          },
        ],
        XAxisKey: 'x',
        YAxisKey: 'y',
      },
    };

    const result = metadataToAIChartData(metadata);

    expect(result?.chart.labels).toEqual([]);
    expect((result?.chart.data as ChartSeries[])[0].data).toEqual([]);
  });

  it('handles series with undefined data', () => {
    const metadata: ExecutionMetadata = {
      ...baseMetadata,
      generated_chart: {
        Series: [
          {
            name: 'No Data Series',
            // Intentionally undefined to validate fallback
            data: undefined as unknown as Array<{
              x: string | number;
              y: number;
            }>,
          },
        ],
        XAxisKey: 'x',
        YAxisKey: 'y',
      },
    };

    const result = metadataToAIChartData(metadata);

    expect(result?.chart.labels).toEqual([]);
    expect((result?.chart.data as ChartSeries[])[0].data).toEqual([]);
  });

  it('converts x values to strings and y values to numbers', () => {
    const metadata: ExecutionMetadata = {
      ...baseMetadata,
      generated_chart: {
        Series: [
          {
            name: 'Test Series',
            data: [
              { x: 123, y: 456 },
              { x: 'true', y: 789.5 },
              { x: 'null', y: 0 },
            ],
          },
        ],
        XAxisKey: 'x',
        YAxisKey: 'y',
      },
    };

    const result = metadataToAIChartData(metadata);

    expect(result?.chart.labels).toEqual(['123', 'true', 'null']);
    expect((result?.chart.data as ChartSeries[])[0].data).toEqual([
      456, 789.5, 0,
    ]);
  });

  it('handles missing chart_type by defaulting to column', () => {
    const metadata = { ...baseMetadata };
    delete metadata.chart_type;

    const result = metadataToAIChartData(metadata);

    expect(result?.chart.type).toBe(CHART_TYPE.column);
  });

  it('creates timestamp from current date', () => {
    // Test that timestamp is created using current time
    const result = metadataToAIChartData(baseMetadata);

    expect(result?.timestamp).toBe('2024-01-01T00:00:00.000Z');
  });
});
