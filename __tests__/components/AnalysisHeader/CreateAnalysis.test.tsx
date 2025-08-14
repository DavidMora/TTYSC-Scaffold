import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateAnalysis } from '@/components/AnalysisHeader/CreateAnalysis';

// Mock AppModal component
jest.mock('@/components/Modals/ConfirmationModal', () => ({
  ConfirmationModal: function MockConfirmationModal({
    isOpen,
    onClose,
    title,
    message,
    width,
    actions,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    width?: string;
    actions: Array<{
      label: string;
      design?: string;
      disabled?: boolean;
      onClick: () => void;
    }>;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="app-modal" data-width={width}>
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-message">{message}</div>
        <div data-testid="modal-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              data-testid={`modal-action-${action.label
                .toLowerCase()
                .replace(/\s+/g, '-')}`}
              data-design={action.design}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
        <button data-testid="modal-close" onClick={onClose}>
          ×
        </button>
      </div>
    );
  },
}));

describe('CreateAnalysis', () => {
  const mockOnCreateAnalysis = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnCreateAnalysis.mockResolvedValue(undefined);
  });

  it('should close modal when close button is clicked', () => {
    render(
      <CreateAnalysis
        onCreateAnalysis={mockOnCreateAnalysis}
        isCreating={false}
      />
    );

    fireEvent.click(screen.getByTestId('ui5-flexbox'));
    expect(screen.getByTestId('app-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close'));
    expect(screen.queryByTestId('app-modal')).not.toBeInTheDocument();
  });

  it('should call onCreateAnalysis and close modal when start new is clicked', async () => {
    render(
      <CreateAnalysis
        onCreateAnalysis={mockOnCreateAnalysis}
        isCreating={false}
      />
    );

    fireEvent.click(screen.getByTestId('ui5-flexbox'));

    fireEvent.click(screen.getByTestId('modal-action-start-new'));

    await waitFor(() => {
      expect(mockOnCreateAnalysis).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('app-modal')).not.toBeInTheDocument();
    });
  });

  it('should handle mouse enter and leave events for hover effect', () => {
    render(
      <CreateAnalysis
        onCreateAnalysis={mockOnCreateAnalysis}
        isCreating={false}
      />
    );

    const flexbox = screen.getByTestId('ui5-flexbox');

    fireEvent.mouseEnter(flexbox);
    fireEvent.mouseLeave(flexbox);

    fireEvent.click(flexbox);
    expect(screen.getByTestId('app-modal')).toBeInTheDocument();
  });

  it('should disable buttons and show creating state when isCreating is true', () => {
    render(
      <CreateAnalysis
        onCreateAnalysis={mockOnCreateAnalysis}
        isCreating={true}
      />
    );

    fireEvent.click(screen.getByTestId('ui5-flexbox'));

    expect(screen.getByTestId('app-modal')).toBeInTheDocument();

    expect(screen.getByTestId('modal-action-cancel')).toBeDisabled();
    expect(screen.getByTestId('modal-action-creating...')).toBeDisabled();
    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });
});
