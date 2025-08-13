import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/hooks/settings', () => ({
  useSettings: () => ({
    data: undefined,
    isLoading: false,
    error: new Error('fail'),
    mutate: jest.fn(),
  }),
}));

import SettingsNavigationItem from '@/components/AppLayout/SidebarItems/SettingsNavigationItem';

describe('SettingsNavigationItem error state', () => {
  it('shows error when settings loading fails', () => {
    render(<SettingsNavigationItem />);
    expect(screen.getByText('Error loading settings.')).toBeInTheDocument();
  });
});
