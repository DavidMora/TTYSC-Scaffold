const React = require('react');

module.exports = {
  ColumnChart: ({ dataset, dimensions, measures, chartConfig }) => {
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
  },
};
