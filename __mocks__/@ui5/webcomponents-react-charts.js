const React = require('react');

// Mock chart components
const BarChart = ({ dataset, dimensions, measures }) => (
  <div
    data-testid="bar-chart-mock"
    data-dataset={JSON.stringify(dataset)}
    data-dimensions={JSON.stringify(dimensions)}
    data-measures={JSON.stringify(measures)}
  >
    Mocked BarChart
  </div>
);

const LineChart = ({ dataset, dimensions, measures }) => (
  <div
    data-testid="line-chart-mock"
    data-dataset={JSON.stringify(dataset)}
    data-dimensions={JSON.stringify(dimensions)}
    data-measures={JSON.stringify(measures)}
  >
    Mocked LineChart
  </div>
);

const PieChart = ({ dataset, dimension, measure }) => (
  <div
    data-testid="pie-chart-mock"
    data-dataset={JSON.stringify(dataset)}
    data-dimension={JSON.stringify(dimension)}
    data-measure={JSON.stringify(measure)}
  >
    Mocked PieChart
  </div>
);

const DonutChart = ({ dataset, dimension, measure }) => (
  <div
    data-testid="donut-chart-mock"
    data-dataset={JSON.stringify(dataset)}
    data-dimension={JSON.stringify(dimension)}
    data-measure={JSON.stringify(measure)}
  >
    Mocked DonutChart
  </div>
);

const ColumnChart = ({ dataset, dimensions, measures, chartConfig }) => {
  const domain = chartConfig?.yAxisConfig?.domain;

  if (Array.isArray(domain)) {
    const [minFn, maxFn] = domain;

    if (typeof minFn === 'function') {
      minFn(100);
    }

    if (typeof maxFn === 'function') {
      maxFn(100);
    }
  }

  return (
    <div
      data-testid="column-chart-mock"
      data-dataset={JSON.stringify(dataset)}
      data-dimensions={JSON.stringify(dimensions)}
      data-measures={JSON.stringify(measures)}
    >
      Mocked ColumnChart
    </div>
  );
};

const BulletChart = ({ dataset, dimensions, measures }) => (
  <div
    data-testid="bullet-chart-mock"
    data-dataset={JSON.stringify(dataset)}
    data-dimensions={JSON.stringify(dimensions)}
    data-measures={JSON.stringify(measures)}
  >
    Mocked BulletChart
  </div>
);

const ColumnChartWithTrend = ({ dataset, dimensions, measures }) => (
  <div
    data-testid="column-with-trend-chart-mock"
    data-dataset={JSON.stringify(dataset)}
    data-dimensions={JSON.stringify(dimensions)}
    data-measures={JSON.stringify(measures)}
  >
    Mocked ColumnChartWithTrend
  </div>
);

const ComposedChart = ({ dataset, dimensions, measures }) => (
  <div
    data-testid="composed-chart-mock"
    data-dataset={JSON.stringify(dataset)}
    data-dimensions={JSON.stringify(dimensions)}
    data-measures={JSON.stringify(measures)}
  >
    Mocked ComposedChart
  </div>
);

const RadarChart = ({ dataset, dimensions, measures }) => (
  <div
    data-testid="radar-chart-mock"
    data-dataset={JSON.stringify(dataset)}
    data-dimensions={JSON.stringify(dimensions)}
    data-measures={JSON.stringify(measures)}
  >
    Mocked RadarChart
  </div>
);

module.exports = {
  BarChart,
  LineChart,
  PieChart,
  DonutChart,
  ColumnChart,
  BulletChart,
  ColumnChartWithTrend,
  ComposedChart,
  RadarChart,
};
