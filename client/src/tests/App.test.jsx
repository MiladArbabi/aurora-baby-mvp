import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../components/App';

// Test suite for App component
describe('App Component Tests', () => {
  // Test rendering title without mocking fetch (uses polyfill)
  it('renders Aurora Baby title', () => {
    render(<App />);
    expect(screen.getByText(/Aurora Baby/i)).toBeInTheDocument();
  });

  // Test displaying users with mocked fetch
  it('displays users fetched from the backend', async () => {
    // Mock fetch for this test only
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { _id: '1', name: 'Birk' },
          { _id: '2', name: 'Freya' }
        ])
      })
    );

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Birk')).toBeInTheDocument();
      expect(screen.getByText('Freya')).toBeInTheDocument();
    });
  });

  // Test adding a user with mocked fetch
  it('adds a new user on form submission', async () => {
    // Mock fetch for this test only
    global.fetch = jest.fn();
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: '3', name: 'Luna' })
      });

    render(<App />);
    const input = screen.getByPlaceholderText(/enter a name/i);
    const button = screen.getByText(/add user/i);

    fireEvent.change(input, { target: { value: 'Luna' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Luna' })
    });
  });
});