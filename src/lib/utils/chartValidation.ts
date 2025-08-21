import { ChartData } from '@/lib/types/charts';

const isNonEmptyArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value) && value.length > 0;
};

const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !Number.isNaN(value);
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

    if (dataArray.length !== (labels as unknown[]).length) {
      return 'Data length must match labels length';
    }
  }

  if (labels.some((label) => label === 'undefined')) {
    return 'Labels must be an array of strings';
  }

  return undefined;
};
