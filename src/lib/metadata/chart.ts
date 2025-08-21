import { ExecutionMetadata } from '@/lib/types/chats';
import { AIChartData, CHART_TYPE } from '@/lib/types/charts';
import { CHART_TYPES } from '@/lib/constants/UI/chartTypes';

export function metadataToAIChartData(
  meta?: ExecutionMetadata | null
): AIChartData | null {
  const gc = meta?.generated_chart;
  if (!gc || !Array.isArray(gc.Series) || gc.Series.length === 0) return null;
  const firstSeries = gc.Series[0];
  const labels = (firstSeries.data || []).map((p) => String(p.x));
  const values = (firstSeries.data || []).map((p) => Number(p.y));
  return {
    timestamp: new Date().toISOString(),
    label: meta?.chart_label || 'Chart',
    chart: {
      type: CHART_TYPES[meta?.chart_type ?? ''] ?? CHART_TYPE.column,
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
