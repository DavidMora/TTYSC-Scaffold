import React from 'react';

// Minimal mock for TableToolbar to avoid element type errors in tests
const TableToolbar = ({ className, onSearch }) => {
  return (
    <div data-testid="table-toolbar" className={className}>
      <input
        data-testid="search-input"
        placeholder="Search..."
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
      Mock Table Toolbar
    </div>
  );
};
export default TableToolbar;
