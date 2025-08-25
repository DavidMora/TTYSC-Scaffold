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

  describe('FF_RAW_DATA_NAVIGATION feature flag', () => {
    const setFlag = (
      overrides: Partial<ReturnType<typeof useFeatureFlag>> = {}
    ) => {
      jest.mocked(useFeatureFlag).mockReturnValue({
        flag: true,
        loading: false,
        error: null,
        ...overrides,
      });
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders when feature flag is enabled', () => {
      setFlag({ flag: true, loading: false, error: null });

      const { container } = renderWithProvider(<RawDataNavigationItem />);
      expect(container).not.toBeEmptyDOMElement();
    });

    it('returns null when feature flag is disabled', () => {
      setFlag({ flag: false, loading: false, error: null });

      const { container } = renderWithProvider(<RawDataNavigationItem />);
      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when feature flag is loading', () => {
      setFlag({ loading: true, error: null });

      const { container } = renderWithProvider(<RawDataNavigationItem />);
      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when feature flag has error', () => {
      setFlag({
        flag: true,
        loading: false,
        error: 'Feature flag error',
      });

      const { container } = renderWithProvider(<RawDataNavigationItem />);
      expect(container).toBeEmptyDOMElement();
    });

    it('uses the correct feature flag key', () => {
      setFlag({ flag: true, loading: false, error: null });

      renderWithProvider(<RawDataNavigationItem />);
      expect(jest.mocked(useFeatureFlag)).toHaveBeenCalledWith(
        'FF_RAW_DATA_NAVIGATION'
      );
    });
  });
});
