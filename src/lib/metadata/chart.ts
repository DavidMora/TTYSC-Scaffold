import { ExecutionMetadata } from '../types/chats';
import { AIChartData } from '../types/charts';

export function metadataToAIChartData(
  meta?: ExecutionMetadata | null
): AIChartData | null {
  const gc = meta?.generated_chart;
  if (!gc || !Array.isArray(gc.Series) || gc.Series.length === 0) return null;
  const firstSeries = gc.Series[0];
  const labels = (firstSeries.data || []).map((p) => String(p.x));
  const values = (firstSeries.data || []).map((p) => Number(p.y));
  return {
    headline: meta?.chart_label || 'Chart',
    timestamp: new Date().toISOString(),
    label: meta?.chart_label || 'Chart',
    chart: {
      type: 'column',
      labels,
      data: [
        {
          name: firstSeries.name || 'Series',
          data: values,
        },
      ],
    },
  };
}
