import React from 'react';

// Minimal mock for SettingsModal to avoid element type errors in tests
const SettingsModal = ({
  isOpen,
  onClose,
  onSave,
  onReset,
  headers,
  visibleColumns = [],
}) => {
  if (!isOpen) return null;
  return (
    <div data-testid="mock-settings-modal">
      <button
        onClick={() =>
          onSave &&
          onSave({
            columns: visibleColumns,
            sortOrder: 'none',
            searchTerm: '',
          })
        }
      >
        OK
      </button>
      <button onClick={onClose}>Cancel</button>
      <button onClick={onReset}>Reset</button>
      {headers && headers.map((h) => <div key={h.accessorKey}>{h.text}</div>)}
    </div>
  );
};
export default SettingsModal;
