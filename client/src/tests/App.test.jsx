import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../components/App';

// Test suite for App component
describe('App Component Tests', () => {
  it('renders Aurora Baby title', () => {
    render(<App />);
    expect(screen.getByText(/Aurora Baby/i)).toBeInTheDocument();
  });

  it('displays users fetched from the backend', async () => {
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

  it('adds a new user on form submission', async () => {
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
  });

  // Updated test: Mocked backend interaction
  it('fetches and adds users with mocked backend', async () => {
    global.fetch = jest.fn();
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]) // Initial empty list
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: '4', name: 'Nova' }) // POST response
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ _id: '4', name: 'Nova' }]) // Updated list
      });

    render(<App />);
    expect(screen.getByText(/Aurora Baby/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/enter a name/i);
    const button = screen.getByText(/add user/i);

    fireEvent.change(input, { target: { value: 'Nova' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Nova')).toBeInTheDocument();
    });
  });
});