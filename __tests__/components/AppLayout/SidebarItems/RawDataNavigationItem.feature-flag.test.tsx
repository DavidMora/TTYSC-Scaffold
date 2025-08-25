import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RawDataModalProvider } from '@/contexts/RawDataModalContext';
import RawDataNavigationItem from '@/components/AppLayout/SidebarItems/RawDataNavigationItem';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

// Mock the useFeatureFlag hook
jest.mock('@/hooks/useFeatureFlags');

// Use project-level manual mocks provided in __mocks__
jest.mock('@ui5/webcomponents-react');

describe('RawDataNavigationItem Feature Flag Tests', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<RawDataModalProvider>{component}</RawDataModalProvider>);
  };

  describe('FF_Raw_Data_Navigation feature flag', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders when feature flag is enabled', () => {
      (useFeatureFlag as jest.Mock).mockReturnValue({
        flag: true,
        loading: false,
        error: null,
      });

      const { container } = renderWithProvider(<RawDataNavigationItem />);
      expect(container).not.toBeEmptyDOMElement();
    });

    it('returns null when feature flag is disabled', () => {
      (useFeatureFlag as jest.Mock).mockReturnValue({
        flag: false,
        loading: false,
        error: null,
      });

      const { container } = renderWithProvider(<RawDataNavigationItem />);
      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when feature flag is loading', () => {
      (useFeatureFlag as jest.Mock).mockReturnValue({
        loading: true,
        error: null,
      });

      const { container } = renderWithProvider(<RawDataNavigationItem />);
      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when feature flag has error', () => {
      (useFeatureFlag as jest.Mock).mockReturnValue({
        flag: true,
        loading: false,
        error: new Error('Feature flag error'),
      });

      const { container } = renderWithProvider(<RawDataNavigationItem />);
      expect(container).toBeEmptyDOMElement();
    });

    it('uses the correct feature flag key', () => {
      (useFeatureFlag as jest.Mock).mockReturnValue({
        flag: true,
        loading: false,
        error: null,
      });

      renderWithProvider(<RawDataNavigationItem />);
      expect(useFeatureFlag).toHaveBeenCalledWith('FF_Raw_Data_Navigation');
    });
  });
});
