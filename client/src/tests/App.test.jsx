import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../components/App';

// Mock firebase/auth (for Login component)
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  })),
}));

// Mock ../firebase (not used directly in App.jsx, but required by Login)
jest.mock('../firebase', () => ({
  auth: {},
}));

describe('App Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    const { signInWithEmailAndPassword } = require('firebase/auth');
    signInWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('fake-token') },
    });
  });

  it('renders login screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Aurora Baby/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  });

  it('displays users fetched from the backend after login', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Emma' }] }),
      }) // /api/profiles
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ _id: '1', name: 'Birk' }, { _id: '2', name: 'Freya' }]),
      }); // /api/users

    render(<App />);

    // Simulate email login
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText(/Login/i));
    });

    // Wait for ProfileSelection to appear after login
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument(), { timeout: 3000 });

    // Select a profile
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    // Verify users are displayed
    await waitFor(() => {
      expect(screen.getByText('Birk')).toBeInTheDocument();
      expect(screen.getByText('Freya')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('adds a new user on form submission after login', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Emma' }] }),
      }) // /api/profiles
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // Initial /api/users
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: '3', name: 'Luna' }),
      }); // POST /api/users

    render(<App />);

    // Simulate email login
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText(/Login/i));
    });

    // Wait for ProfileSelection
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument(), { timeout: 3000 });

    // Select a profile
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    // Wait for the main app screen
    await waitFor(() => expect(screen.getByText(/Aurora Baby/i)).toBeInTheDocument(), { timeout: 3000 });

    // Add a new user
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter a name/i), { target: { value: 'Luna' } });
      fireEvent.click(screen.getByText(/Add User/i));
    });

    // Verify the new user is displayed
    await waitFor(() => expect(screen.getByText('Luna')).toBeInTheDocument(), { timeout: 3000 });
  });
});