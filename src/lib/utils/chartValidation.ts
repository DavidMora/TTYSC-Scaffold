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
    return 'Error Displaying Chart: Invalid chart configuration';
  }

  if (!c.type) {
    return 'Error Displaying Chart: Chart type is required';
  }

  const { labels, data } = c;

  if (!isNonEmptyArray(labels)) {
    return 'Error Displaying Chart: Labels must be a non-empty array';
  }

  if (!isNonEmptyArray(data)) {
    return 'Error Displaying Chart: Data must be a non-empty array';
  }

  const dataArray = data as unknown[];
  const firstItem = dataArray[0];

  if (typeof firstItem === 'number') {
    if (!dataArray.every(isNumber)) {
      return 'Error Displaying Chart: Data must be an array of numbers';
    }

    if (dataArray.length !== labels.length) {
      return 'Error Displaying Chart: Data length must match labels length';
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
      return 'Error Displaying Chart: Data must be an array of { name: string; data: number[] }';
    }

    const invalid = dataArray.find((s) => s.data.length !== labels.length);
    if (invalid) {
      return 'Error Displaying Chart: Each series data length must match labels length';
    }
  }

  if (labels.some((label) => label === 'undefined')) {
    return 'Error Displaying Chart: Labels must be an array of strings';
  }

  return undefined;
};
