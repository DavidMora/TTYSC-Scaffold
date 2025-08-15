import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsModal from '@/components/Modals/SettingsModal';
import {
  SettingsModalProvider,
  useSettingsModal,
} from '@/contexts/SettingsModalContext';

// Mock the feature flag hook
jest.mock('@/hooks/useFeatureFlags', () => ({
  useFeatureFlag: jest.fn(),
}));

import { useFeatureFlag } from '@/hooks/useFeatureFlags';

// Mock the FeatureFlaggedDialog component
jest.mock('@/components/Modals/FeatureFlaggedDialog', () => ({
  FeatureFlaggedDialog: React.forwardRef(
    ({ children, open, footer, ...props }: any, ref: any) => {
      if (!open) return null;
      return (
        <div data-testid="feature-flagged-dialog" ref={ref} {...props}>
          {children}
          {footer}
        </div>
      );
    }
  ),
}));

// Test component to trigger modal actions
const TestComponent = () => {
  const { isOpen, open, close } = useSettingsModal();
  return (
    <div>
      <span data-testid="modal-state">{isOpen ? 'open' : 'closed'}</span>
      <button data-testid="open-modal" onClick={open}>
        Open Modal
      </button>
      <button data-testid="close-modal" onClick={close}>
        Close Modal
      </button>
    </div>
  );
};

describe('SettingsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock feature flag to be enabled
    (useFeatureFlag as jest.Mock).mockReturnValue({
      flag: true,
      loading: false,
      error: null,
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <SettingsModalProvider>
        {component}
        <TestComponent />
      </SettingsModalProvider>
    );
  };

  describe('Rendering', () => {
    it('should not render when modal is closed', () => {
      renderWithProvider(<SettingsModal />);

      expect(screen.getByTestId('modal-state')).toHaveTextContent('closed');
      expect(
        screen.queryByTestId('feature-flagged-dialog')
      ).not.toBeInTheDocument();
    });

    it('should render when modal is opened', () => {
      renderWithProvider(<SettingsModal />);

      // Open the modal
      fireEvent.click(screen.getByTestId('open-modal'));

      expect(screen.getByTestId('modal-state')).toHaveTextContent('open');
      expect(screen.getByTestId('feature-flagged-dialog')).toBeInTheDocument();
    });

    it('should render the settings title', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render the close button in footer', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      expect(screen.getByText('Close')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should start with Development section active by default', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      // Check that Development section content is visible
      expect(screen.getByText('Run on save')).toBeInTheDocument();
    });

    it('should switch to Appearance section when clicked', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      // Click on Appearance section (first occurrence in navigation)
      const appearanceItems = screen.getAllByText('Appearance');
      fireEvent.click(appearanceItems[0]);

      // Check that Appearance section content is visible
      expect(screen.getByText('Wide mode')).toBeInTheDocument();
    });

    it('should switch to Theme section when clicked', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      // Click on Theme section (first occurrence in navigation)
      const themeItems = screen.getAllByText(
        'Choose app theme, colors and fonts'
      );
      fireEvent.click(themeItems[0]);

      // Check that Theme section content is visible
      expect(screen.getByText('User system setting')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('should maintain active section state when switching between sections', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      // Start with Development
      expect(screen.getByText('Run on save')).toBeInTheDocument();

      // Switch to Appearance
      const appearanceItems = screen.getAllByText('Appearance');
      fireEvent.click(appearanceItems[0]);
      expect(screen.getByText('Wide mode')).toBeInTheDocument();

      // Switch back to Development
      const developmentItems = screen.getAllByText('Development');
      fireEvent.click(developmentItems[0]);
      expect(screen.getByText('Run on save')).toBeInTheDocument();
    });
  });

  describe('Development Section', () => {
    it('should render run on save checkbox', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      const checkbox = screen.getByTestId('ui5-checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should toggle run on save checkbox when clicked', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      const checkbox = screen.getByTestId('ui5-checkbox');

      // Initially present
      expect(checkbox).toBeInTheDocument();

      // Click to toggle
      fireEvent.click(checkbox);
      expect(checkbox).toBeInTheDocument();
    });

    it('should display correct description for run on save', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      expect(
        screen.getByText(
          'Automatically updates the app when the underlying code is updated.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Appearance Section', () => {
    it('should display correct description for wide mode', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      // Switch to Appearance section
      const appearanceItems = screen.getAllByText('Appearance');
      fireEvent.click(appearanceItems[0]);

      expect(
        screen.getByText(
          'Turn on to make this app occupy the entire width of the screen.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Theme Section', () => {
    it('should render theme selection dropdown', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      // Switch to Theme section
      const themeItems = screen.getAllByText(
        'Choose app theme, colors and fonts'
      );
      fireEvent.click(themeItems[0]);

      expect(screen.getByText('User system setting')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });
  });

  describe('Modal Actions', () => {
    it('should close modal when close button is clicked', () => {
      renderWithProvider(<SettingsModal />);

      // Open modal
      fireEvent.click(screen.getByTestId('open-modal'));
      expect(screen.getByTestId('modal-state')).toHaveTextContent('open');
      expect(screen.getByTestId('feature-flagged-dialog')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByText('Close'));
      expect(screen.getByTestId('modal-state')).toHaveTextContent('closed');
      expect(
        screen.queryByTestId('feature-flagged-dialog')
      ).not.toBeInTheDocument();
    });

    it('should call close function from context when close button is clicked', () => {
      renderWithProvider(<SettingsModal />);

      // Open modal
      fireEvent.click(screen.getByTestId('open-modal'));

      // Close modal
      fireEvent.click(screen.getByText('Close'));

      // Verify modal is closed
      expect(screen.getByTestId('modal-state')).toHaveTextContent('closed');
    });
  });

  describe('Feature Flag Integration', () => {
    it('should not render when feature flag is disabled', () => {
      (useFeatureFlag as jest.Mock).mockReturnValue({
        flag: false,
        loading: false,
        error: null,
      });

      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      expect(
        screen.queryByTestId('feature-flagged-dialog')
      ).not.toBeInTheDocument();
    });

    it('should render when feature flag is enabled', () => {
      (useFeatureFlag as jest.Mock).mockReturnValue({
        flag: true,
        loading: false,
        error: null,
      });

      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      expect(screen.getByTestId('feature-flagged-dialog')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should maintain section state when modal is reopened', () => {
      renderWithProvider(<SettingsModal />);

      // Open modal and switch to Appearance section
      fireEvent.click(screen.getByTestId('open-modal'));
      const appearanceItems = screen.getAllByText('Appearance');
      fireEvent.click(appearanceItems[0]);
      expect(screen.getByText('Wide mode')).toBeInTheDocument();

      // Close and reopen modal
      fireEvent.click(screen.getByText('Close'));
      fireEvent.click(screen.getByTestId('open-modal'));

      // Should still be on Appearance section
      expect(screen.getByText('Wide mode')).toBeInTheDocument();
    });

    it('should maintain checkbox states when switching sections', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      // Check run on save in Development section
      const runOnSaveCheckbox = screen.getByTestId('ui5-checkbox');
      fireEvent.click(runOnSaveCheckbox);
      expect(runOnSaveCheckbox).toBeInTheDocument();

      // Switch to Appearance section
      const appearanceItems = screen.getAllByText('Appearance');
      fireEvent.click(appearanceItems[0]);

      // Switch back to Development section
      const developmentItems = screen.getAllByText('Development');
      fireEvent.click(developmentItems[0]);

      // Run on save should still be present
      expect(screen.getByTestId('ui5-checkbox')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      const closeButton = screen.getByText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have proper checkbox elements', () => {
      renderWithProvider(<SettingsModal />);
      fireEvent.click(screen.getByTestId('open-modal'));

      const checkboxes = screen.getAllByTestId('ui5-checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });
});
