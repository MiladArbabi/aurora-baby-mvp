import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ProfileSelectionScreen from '../screens/ProfileSelectionScreen';

describe('ProfileSelection Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Mock global.fetch as a Jest mock function
    global.fetch = jest.fn() as jest.Mock;
    // Suppress console errors for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders profile selection form', () => {
    render(<ProfileSelectionScreen onSelect={() => {}} />);
    expect(screen.getByText(/Select Your Child/i)).toBeInTheDocument();
  });

  it('fetches and displays profiles for authenticated user', async () => {
    const mockProfiles = {
      parent: { name: 'Jane', relationship: 'Mother' },
      children: [{ _id: '1', name: 'Emma' }],
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfiles),
    });
    localStorage.setItem('token', 'fake-token');

    render(<ProfileSelectionScreen onSelect={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/Parent: Jane \(Mother\)/i)).toBeInTheDocument();
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });
  });

  it('displays error when token is missing', () => {
    render(<ProfileSelectionScreen onSelect={() => {}} />);
    expect(screen.getByText(/No authentication token found/i)).toBeInTheDocument();
  });

  it('displays error when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch profiles'));
    localStorage.setItem('token', 'fake-token');

    render(<ProfileSelectionScreen onSelect={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch profiles')).toBeInTheDocument();
    });
  });

  it('selects a child and triggers onSelect callback', async () => {
    const mockProfiles = {
      parent: { name: 'Jane', relationship: 'Mother' },
      children: [{ _id: '1', name: 'Emma' }],
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfiles),
    });
    localStorage.setItem('token', 'fake-token');
    const mockOnSelect = jest.fn();

    render(<ProfileSelectionScreen onSelect={mockOnSelect} />);
    await waitFor(() => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText('Continue'));
      expect(mockOnSelect).toHaveBeenCalledWith('1');
    });
  });
});