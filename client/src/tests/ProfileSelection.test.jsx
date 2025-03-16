import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ProfileSelection from '../components/ProfileSelection';

// Mock fetch for API simulation
global.fetch = jest.fn();

describe('ProfileSelection Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Suppress console errors for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders profile selection form', () => {
    render(<ProfileSelection onSelect={() => {}} />);
    expect(screen.getByText(/Select Your Child/i)).toBeInTheDocument();
  });

  it('fetches and displays profiles for authenticated user', async () => {
    const mockProfiles = {
      parent: { name: 'Jane', relationship: 'Mother' },
      children: [{ _id: '1', name: 'Emma' }],
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfiles),
    });
    localStorage.setItem('token', 'fake-token');

    render(<ProfileSelection onSelect={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/Parent: Jane \(Mother\)/i)).toBeInTheDocument();
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });
  });

  it('displays error when token is missing', () => {
    render(<ProfileSelection onSelect={() => {}} />);
    expect(screen.getByText(/No authentication token found/i)).toBeInTheDocument();
  });

  it('displays error when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch profiles'));
    localStorage.setItem('token', 'fake-token');

    render(<ProfileSelection onSelect={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch profiles')).toBeInTheDocument();
    });
  });

  it('selects a child and triggers onSelect callback', async () => {
    const mockProfiles = {
      parent: { name: 'Jane', relationship: 'Mother' },
      children: [{ _id: '1', name: 'Emma' }],
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfiles),
    });
    localStorage.setItem('token', 'fake-token');
    const mockOnSelect = jest.fn();

    render(<ProfileSelection onSelect={mockOnSelect} />);
    await waitFor(() => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText('Continue'));
      expect(mockOnSelect).toHaveBeenCalledWith('1');
    });
  });
});
