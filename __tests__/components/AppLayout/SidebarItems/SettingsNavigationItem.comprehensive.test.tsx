import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock UI5 components
jest.mock('@ui5/webcomponents-react', () => ({
  SideNavigationItem: ({
    children,
    text,
    icon,
    unselectable,
  }: {
    children: React.ReactNode;
    text: string;
    icon: string;
    unselectable: boolean;
  }) => (
    <div
      data-testid="ui5-side-navigation-item"
      data-text={text}
      data-icon={icon}
      data-unselectable={unselectable}
    >
      {children}
    </div>
  ),
  FlexBox: ({
    children,
    direction,
    style,
  }: {
    children: React.ReactNode;
    direction?: string;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="flex-box" data-direction={direction} style={style}>
      {children}
    </div>
  ),
  FlexBoxDirection: {
    Column: 'Column',
  },
  Switch: ({
    checked,
    disabled,
    onChange,
  }: {
    checked: boolean;
    disabled: boolean;
    onChange: () => void;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      data-testid="switch"
    />
  ),
  Label: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <label data-testid="label" style={style}>
      {children}
    </label>
  ),
  RadioButton: ({
    name,
    text,
    checked,
    disabled,
    onChange,
    style,
  }: {
    name: string;
    text: string;
    checked: boolean;
    disabled: boolean;
    onChange: () => void;
    style?: React.CSSProperties;
  }) => (
    <label style={style}>
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        data-testid={`radio-${text.toLowerCase()}`}
      />
      {text}
    </label>
  ),
}));

// Test to cover SettingsNavigationItem uncovered lines 38, 70-93, 104, 106

// Mock setup for error state coverage
const mockUseSettingsError = () => ({
  data: null,
  isLoading: false,
  error: new Error('Network error'),
  mutate: jest.fn(),
});

// Mock setup for normal state
const mockUseSettingsNormal = () => ({
  data: { shareChats: true, hideIndexTable: false },
  isLoading: false,
  error: null,
  mutate: jest.fn(),
});

// Mock setup for failed update
const mockUpdateSettingsFail = jest.fn().mockResolvedValue({
  ok: false,
  statusText: 'Server Error',
});

const mockUpdateSettingsSuccess = jest.fn().mockResolvedValue({ ok: true });

jest.mock('@/hooks/settings');
jest.mock('@/lib/services/settings.service');

describe('SettingsNavigationItem - Missing Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render error state (lines 70-75)', () => {
    const { useSettings } = require('@/hooks/settings');
    useSettings.mockImplementation(mockUseSettingsError);

    const SettingsNavigationItem =
      require('@/components/AppLayout/SidebarItems/SettingsNavigationItem').default;

    render(<SettingsNavigationItem />);

    expect(screen.getByText('Error loading settings.')).toBeInTheDocument();
    expect(
      screen.queryByText('Share chats for development')
    ).not.toBeInTheDocument();
  });

  it('should handle failed update and show error (lines 104, 106)', async () => {
    const { useSettings } = require('@/hooks/settings');
    const { updateSettings } = require('@/lib/services/settings.service');

    useSettings.mockImplementation(mockUseSettingsNormal);
    updateSettings.mockImplementation(mockUpdateSettingsFail);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const SettingsNavigationItem =
      require('@/components/AppLayout/SidebarItems/SettingsNavigationItem').default;

    render(<SettingsNavigationItem />);

    const switchElement = screen.getByRole('checkbox');
    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update settings:',
        'Server Error'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to update settings')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should show update error message when present', async () => {
    const { useSettings } = require('@/hooks/settings');
    const { updateSettings } = require('@/lib/services/settings.service');

    useSettings.mockImplementation(mockUseSettingsNormal);
    updateSettings.mockImplementation(mockUpdateSettingsFail);

    const SettingsNavigationItem =
      require('@/components/AppLayout/SidebarItems/SettingsNavigationItem').default;

    render(<SettingsNavigationItem />);

    const yesRadio = screen.getByRole('radio', { name: 'Yes' });
    fireEvent.click(yesRadio);

    await waitFor(() => {
      expect(screen.getByText('Failed to update settings')).toBeInTheDocument();
    });
  });

  it('should show updating state during update', async () => {
    const { useSettings } = require('@/hooks/settings');
    const { updateSettings } = require('@/lib/services/settings.service');

    useSettings.mockImplementation(mockUseSettingsNormal);

    let resolveUpdate: (value: any) => void;
    updateSettings.mockImplementation(() => {
      return new Promise((resolve) => {
        resolveUpdate = resolve;
      });
    });

    const SettingsNavigationItem =
      require('@/components/AppLayout/SidebarItems/SettingsNavigationItem').default;

    render(<SettingsNavigationItem />);

    const switchElement = screen.getByRole('checkbox');
    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(screen.getByText('Updating settings...')).toBeInTheDocument();
    });

    expect(switchElement).toBeDisabled();

    resolveUpdate!({ ok: true });

    await waitFor(() => {
      expect(
        screen.queryByText('Updating settings...')
      ).not.toBeInTheDocument();
    });
  });

  it('should update state when settings data changes', () => {
    const { useSettings } = require('@/hooks/settings');

    // First render with initial settings
    useSettings.mockImplementation(() => ({
      data: { shareChats: false, hideIndexTable: true },
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    }));

    const SettingsNavigationItem =
      require('@/components/AppLayout/SidebarItems/SettingsNavigationItem').default;

    const { rerender } = render(<SettingsNavigationItem />);

    // Verify initial state
    const switchElement = screen.getByRole('checkbox');
    expect(switchElement).not.toBeChecked();

    // Change settings and rerender
    useSettings.mockImplementation(() => ({
      data: { shareChats: true, hideIndexTable: false },
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    }));

    rerender(<SettingsNavigationItem />);

    // Verify state updated
    expect(switchElement).toBeChecked();
  });
});
