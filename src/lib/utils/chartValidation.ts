import { ChartData, ChartSeries } from '@/lib/types/charts';

const isNonEmptyArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value) && value.length > 0;
};

const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value);
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

export const validateChart = (c: ChartData | undefined): string | undefined => {
  if (!c) {
    return 'Invalid chart configuration';
  }

  if (!c.type) {
    return 'Chart type is required';
  }

  const { labels, data } = c;

  if (!isNonEmptyArray(labels)) {
    return 'Labels must be a non-empty array';
  }

  if (!isNonEmptyArray(data)) {
    return 'Data must be a non-empty array';
  }

  const dataArray = data as unknown[];
  const firstItem = dataArray[0];

  if (typeof firstItem === 'number') {
    if (!dataArray.every(isNumber)) {
      return 'Data must be an array of numbers';
    }

    if (dataArray.length !== labels.length) {
      return 'Data length must match labels length';
    }
  } else {
    const looksLikeSeries = (v: unknown): v is ChartSeries =>
      typeof v === 'object' &&
      v !== null &&
      'name' in v &&
      'data' in v &&
      isNonEmptyString(v.name) &&
      Array.isArray(v.data) &&
      v.data.length > 0 &&
      v.data.every(isNumber);

    if (!dataArray.every(looksLikeSeries)) {
      return 'Data must be an array of { name: string; data: number[] }';
    }

    const invalid = dataArray.find((s) => s.data.length !== labels.length);
    if (invalid) {
      return 'Each series data length must match labels length';
    }
  }

  if (labels.some((label) => label === 'undefined')) {
    return 'Labels must be an array of strings';
  }

  return undefined;
};
