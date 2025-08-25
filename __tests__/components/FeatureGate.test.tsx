import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureGate, ConditionalFeature } from '@/components/FeatureGate';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

// Mock the useFeatureFlag hook
jest.mock('@/hooks/useFeatureFlags', () => ({
  useFeatureFlag: jest.fn(),
}));

const mockUseFeatureFlag = useFeatureFlag as jest.MockedFunction<
  typeof useFeatureFlag
>;

describe('FeatureGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when feature flag is enabled', () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({
        flag: true,
        loading: false,
        error: null,
      });
    });

    it('renders children when flag is enabled', () => {
      render(
        <FeatureGate flag="enableAuthentication">
          <div data-testid="feature-content">Feature is enabled</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('feature-content')).toBeInTheDocument();
      expect(screen.getByText('Feature is enabled')).toBeInTheDocument();
    });

    it('renders children and ignores fallback when flag is enabled', () => {
      render(
        <FeatureGate
          flag="enableAuthentication"
          fallback={<div data-testid="fallback">Fallback content</div>}
        >
          <div data-testid="feature-content">Feature is enabled</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('feature-content')).toBeInTheDocument();
      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    });

    it('calls useFeatureFlag with correct flag', () => {
      render(
        <FeatureGate flag="enableAuthentication">
          <div>Content</div>
        </FeatureGate>
      );

      expect(mockUseFeatureFlag).toHaveBeenCalledWith('enableAuthentication');
      expect(mockUseFeatureFlag).toHaveBeenCalledTimes(1);
    });

    it('works with FF_CHAT_ANALYSIS_SCREEN feature flag', () => {
      render(
        <FeatureGate flag="FF_CHAT_ANALYSIS_SCREEN">
          <div data-testid="chat-analysis">Chat Analysis Content</div>
        </FeatureGate>
      );

      expect(mockUseFeatureFlag).toHaveBeenCalledWith(
        'FF_CHAT_ANALYSIS_SCREEN'
      );
      expect(screen.getByTestId('chat-analysis')).toBeInTheDocument();
    });
  });

  describe('when feature flag is disabled', () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({
        flag: false,
        loading: false,
        error: null,
      });
    });

    it('renders fallback when flag is disabled and fallback is provided', () => {
      render(
        <FeatureGate
          flag="enableAuthentication"
          fallback={<div data-testid="fallback">Fallback content</div>}
        >
          <div data-testid="feature-content">Feature is enabled</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.getByText('Fallback content')).toBeInTheDocument();
      expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument();
    });

    it('renders nothing when flag is disabled and no fallback is provided', () => {
      const { container } = render(
        <FeatureGate flag="enableAuthentication">
          <div data-testid="feature-content">Feature is enabled</div>
        </FeatureGate>
      );

      expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument();
      // Should render empty fragment (null becomes empty div)
      expect(container.firstChild).toBeNull();
    });

    it('renders null fallback explicitly when provided', () => {
      const { container } = render(
        <FeatureGate flag="enableAuthentication" fallback={null}>
          <div data-testid="feature-content">Feature is enabled</div>
        </FeatureGate>
      );

      expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });
  });

  describe('when feature flag is loading', () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({
        flag: false,
        loading: true,
        error: null,
      });
    });

    it('renders loadingFallback when flag is loading and loadingFallback is provided', () => {
      render(
        <FeatureGate
          flag="enableAuthentication"
          fallback={<div data-testid="fallback">Fallback content</div>}
          loadingFallback={<div data-testid="loading-fallback">Loading...</div>}
        >
          <div data-testid="feature-content">Feature is enabled</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('loading-fallback')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
      expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument();
    });

    it('renders null when flag is loading and no loadingFallback is provided', () => {
      const { container } = render(
        <FeatureGate
          flag="enableAuthentication"
          fallback={<div data-testid="fallback">Fallback content</div>}
        >
          <div data-testid="feature-content">Feature is enabled</div>
        </FeatureGate>
      );

      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
      expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });
  });

  describe('with complex children', () => {
    it('renders multiple children when enabled', () => {
      mockUseFeatureFlag.mockReturnValue({
        flag: true,
        loading: false,
        error: null,
      });

      render(
        <FeatureGate flag="enableAuthentication">
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <span data-testid="child3">Child 3</span>
        </FeatureGate>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('child3')).toBeInTheDocument();
    });

    it('renders complex fallback when disabled', () => {
      mockUseFeatureFlag.mockReturnValue({
        flag: false,
        loading: false,
        error: null,
      });

      render(
        <FeatureGate
          flag="enableAuthentication"
          fallback={
            <div data-testid="complex-fallback">
              <h2>Feature Disabled</h2>
              <p>This feature is currently unavailable</p>
            </div>
          }
        >
          <div data-testid="feature-content">Feature content</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('complex-fallback')).toBeInTheDocument();
      expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
      expect(
        screen.getByText('This feature is currently unavailable')
      ).toBeInTheDocument();
      expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument();
    });
  });
});

describe('ConditionalFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when feature flag is enabled', () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({
        flag: true,
        loading: false,
        error: null,
      });
    });

    it('renders enabled content when flag is enabled', () => {
      render(
        <ConditionalFeature
          flag="enableAuthentication"
          enabled={<div data-testid="enabled">Feature enabled content</div>}
          disabled={<div data-testid="disabled">Feature disabled content</div>}
        />
      );

      expect(screen.getByTestId('enabled')).toBeInTheDocument();
      expect(screen.getByText('Feature enabled content')).toBeInTheDocument();
      expect(screen.queryByTestId('disabled')).not.toBeInTheDocument();
    });

    it('renders null when enabled but no enabled content provided', () => {
      const { container } = render(
        <ConditionalFeature
          flag="enableAuthentication"
          disabled={<div data-testid="disabled">Feature disabled content</div>}
        />
      );

      expect(screen.queryByTestId('disabled')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('calls useFeatureFlag with correct flag', () => {
      render(
        <ConditionalFeature
          flag="enableAuthentication"
          enabled={<div>Enabled</div>}
        />
      );

      expect(mockUseFeatureFlag).toHaveBeenCalledWith('enableAuthentication');
      expect(mockUseFeatureFlag).toHaveBeenCalledTimes(1);
    });
  });

  describe('when feature flag is disabled', () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({
        flag: false,
        loading: false,
        error: null,
      });
    });

    it('renders disabled content when flag is disabled', () => {
      render(
        <ConditionalFeature
          flag="enableAuthentication"
          enabled={<div data-testid="enabled">Feature enabled content</div>}
          disabled={<div data-testid="disabled">Feature disabled content</div>}
        />
      );

      expect(screen.getByTestId('disabled')).toBeInTheDocument();
      expect(screen.getByText('Feature disabled content')).toBeInTheDocument();
      expect(screen.queryByTestId('enabled')).not.toBeInTheDocument();
    });

    it('renders null when disabled but no disabled content provided', () => {
      const { container } = render(
        <ConditionalFeature
          flag="enableAuthentication"
          enabled={<div data-testid="enabled">Feature enabled content</div>}
        />
      );

      expect(screen.queryByTestId('enabled')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('renders null explicitly when disabled content is null', () => {
      const { container } = render(
        <ConditionalFeature
          flag="enableAuthentication"
          enabled={<div data-testid="enabled">Feature enabled content</div>}
          disabled={null}
        />
      );

      expect(screen.queryByTestId('enabled')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });
  });

  describe('with complex content', () => {
    it('renders complex enabled content', () => {
      mockUseFeatureFlag.mockReturnValue({
        flag: true,
        loading: false,
        error: null,
      });

      render(
        <ConditionalFeature
          flag="enableAuthentication"
          enabled={
            <div data-testid="complex-enabled">
              <h1>Feature is Active</h1>
              <button>Action Button</button>
              <p>Additional information</p>
            </div>
          }
          disabled={<div data-testid="simple-disabled">Disabled</div>}
        />
      );

      expect(screen.getByTestId('complex-enabled')).toBeInTheDocument();
      expect(screen.getByText('Feature is Active')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
      expect(screen.getByText('Additional information')).toBeInTheDocument();
      expect(screen.queryByTestId('simple-disabled')).not.toBeInTheDocument();
    });

    it('renders complex disabled content', () => {
      mockUseFeatureFlag.mockReturnValue({
        flag: false,
        loading: false,
        error: null,
      });

      render(
        <ConditionalFeature
          flag="enableAuthentication"
          enabled={<div data-testid="simple-enabled">Enabled</div>}
          disabled={
            <div data-testid="complex-disabled">
              <h2>Feature Unavailable</h2>
              <p>This feature is coming soon</p>
              <a href="/info">Learn more</a>
            </div>
          }
        />
      );

      expect(screen.getByTestId('complex-disabled')).toBeInTheDocument();
      expect(screen.getByText('Feature Unavailable')).toBeInTheDocument();
      expect(
        screen.getByText('This feature is coming soon')
      ).toBeInTheDocument();
      expect(screen.getByText('Learn more')).toBeInTheDocument();
      expect(screen.queryByTestId('simple-enabled')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles both enabled and disabled as null', () => {
      mockUseFeatureFlag.mockReturnValue({
        flag: true,
        loading: false,
        error: null,
      });

      const { container } = render(
        <ConditionalFeature
          flag="enableAuthentication"
          enabled={null}
          disabled={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('handles both enabled and disabled as undefined (default)', () => {
      mockUseFeatureFlag.mockReturnValue({
        flag: false,
        loading: false,
        error: null,
      });

      const { container } = render(
        <ConditionalFeature flag="enableAuthentication" />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
