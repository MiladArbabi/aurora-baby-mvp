import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../components/App';

describe('App Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders login screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Welcome Back to Aurora Baby/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  });

  it('displays users fetched from the backend after login', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ token: 'fake-token' }) }) // Login
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Emma' }] }) }) // Profiles
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ _id: '1', name: 'Birk' }, { _id: '2', name: 'Freya' }]) }); // Users
    render(<App />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText(/Login/i));
    });
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });
    await waitFor(() => {
      expect(screen.getByText('Birk')).toBeInTheDocument();
      expect(screen.getByText('Freya')).toBeInTheDocument();
    }, { timeout: 3000 });
    console.log('Fetch calls:', global.fetch.mock.calls);
    screen.debug();
  });

  it('adds a new user on form submission after login', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ token: 'fake-token' }) }) // Login
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Emma' }] }) }) // Profiles
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // Initial users
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ _id: '3', name: 'Luna' }) }); // POST response
    render(<App />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText(/Login/i));
    });
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });
    await waitFor(() => {
      expect(screen.getByText(/Aurora Baby/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    const input = screen.getByPlaceholderText(/Enter a name/i);
    const button = screen.getByText(/Add User/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Luna' } });
      fireEvent.click(button);
    });
    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    }, { timeout: 3000 });
    console.log('Fetch calls:', global.fetch.mock.calls);
    screen.debug();
  });
});