import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../components/App';

// Mock Firebase
jest.mock('../firebase', () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
    onAuthStateChanged: jest.fn((callback) => {
      callback(null); // Initial unauthenticated state
      return jest.fn(); // Mock unsubscribe
    })
  }
}));

describe('App Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders login screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Aurora Baby/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  });

  it('displays users fetched from the backend after login', async () => {
    const mockUserCredential = { user: { getIdToken: () => Promise.resolve('fake-token') } };
    require('../firebase').auth.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Emma' }] }) }) // /api/profiles
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ _id: '1', name: 'Birk' }, { _id: '2', name: 'Freya' }]) }); // /api/users

    render(<App />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText(/Login/i));
    });

    // ProfileSelection step
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    // Users display
    await waitFor(() => {
      expect(screen.getByText('Birk')).toBeInTheDocument();
      expect(screen.getByText('Freya')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('adds a new user on form submission after login', async () => {
    const mockUserCredential = { user: { getIdToken: () => Promise.resolve('fake-token') } };
    require('../firebase').auth.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Emma' }] }) }) // /api/profiles
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // Initial /api/users
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ _id: '3', name: 'Luna' }) }); // POST /api/users

    render(<App />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText(/Login/i));
    });

    // ProfileSelection step
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    // Add user
    await waitFor(() => expect(screen.getByText(/Aurora Baby/i)).toBeInTheDocument());
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter a name/i), { target: { value: 'Luna' } });
      fireEvent.click(screen.getByText(/Add User/i));
    });

    await waitFor(() => expect(screen.getByText('Luna')).toBeInTheDocument(), { timeout: 3000 });
  });
});