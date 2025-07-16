import _ from "lodash";
import React from "react";

export const AnalyticalTable = ({ columns, data, className, ...props }) => {
  const { "data-testid": dataTestId = "ui5-analytical-table" } = props;
  return (
    <div className={className} data-testid={dataTestId}>
      <div role="rowgroup">
        <div
          role="row"
          className="header-row"
          data-testid="ui5-analytical-table-header"
        >
          {columns.map((column, colIndex) => {
            return (
              <div
                key={colIndex}
                role="columnheader"
                className="header-cell"
                data-testid={`ui5-analytical-table-header-cell-${colIndex}`}
              >
                {_.isFunction(column.Header)
                  ? column.Header({ column })
                  : column.Header}
              </div>
            );
          })}
        </div>
        {data.map((row, rowIndex) => {
          return (
            <div
              key={rowIndex}
              role="row"
              className="data-row"
              data-testid={`ui5-analytical-table-row-${rowIndex}`}
            >
              {columns.map((column, colIndex) => {
                return (
                  <div
                    key={colIndex}
                    role="cell"
                    className="data-cell"
                    data-testid={`ui5-analytical-table-cell-${rowIndex}-${colIndex}`}
                  >
                    {column.Cell
                      ? column.Cell({
                          row: { original: row },
                          value: row[column.accessor],
                        })
                      : row[column.accessor]}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
AnalyticalTable.displayName = "AnalyticalTable";
