import { ExecutionMetadata } from '@/lib/types/chats';
import { AIChartData } from '@/lib/types/charts';
import { CHART_TYPES } from '@/lib/constants/UI/chartTypes';

export function metadataToAIChartData(
  meta?: ExecutionMetadata | null
): AIChartData | null {
  const gc = meta?.generated_chart;
  if (!gc || !Array.isArray(gc.Series) || gc.Series.length === 0) return null;
  const mappedType = CHART_TYPES[meta?.chart_type ?? ''];
  const firstSeries = gc.Series[0];
  const labels = (firstSeries.data || []).map((p) => String(p.x));

  const seriesData = gc.Series.map((series) => ({
    name: series.name ?? undefined,
    data: (series.data || []).map((p) => Number(p.y)),
  }));

  return {
    timestamp: new Date().toISOString(),
    label: meta?.chart_label ?? undefined,
    chart: {
      type: mappedType ?? undefined,
      labels,
      data: seriesData,
    },
  };
}
