// client/src/tests/App.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../components/App';

jest.mock('firebase/auth', () => ({
  sendSignInLinkToEmail: jest.fn(),
  isSignInWithEmailLink: jest.fn(),
  signInWithEmailLink: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: () => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  }),
}));

jest.mock('../firebase', () => ({ auth: {} }));

describe('App Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    const { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } = require('firebase/auth');
    sendSignInLinkToEmail.mockResolvedValue();
    isSignInWithEmailLink.mockReturnValue(false);
    signInWithEmailLink.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('fake-token') },
    });
  });

  it('renders signup screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Aurora Baby/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your email/i)).toBeInTheDocument();
  });

  it('displays users fetched from the backend after login for returning user', async () => {
    localStorage.setItem('token', 'fake-token');
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Emma' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ _id: '1', name: 'Birk' }, { _id: '2', name: 'Freya' }]),
      });

    render(<App />);
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    await waitFor(() => {
      expect(screen.getByText('Birk')).toBeInTheDocument();
      expect(screen.getByText('Freya')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('adds a new user on form submission after email link setup for new user', async () => {
    const { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } = require('firebase/auth');
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }) // /api/profiles
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // Initial /api/users
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ _id: '3', name: 'Luna' }) }); // POST /api/users

    // Render App once
    const { container } = render(<App />);

    // Interact with Signup
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Your email/i), { target: { value: 'jane@example.com' } });
      fireEvent.click(screen.getByText(/Sign Up with Email/i));
    });

    await waitFor(() => expect(screen.getByText(/Please follow the instructions in the email sent to jane@example\.com/i)).toBeInTheDocument());

    // Simulate email link sign-in within the same App instance
    isSignInWithEmailLink.mockReturnValue(true);
    window.localStorage.setItem('emailForSignIn', 'jane@example.com');
    // Re-render to trigger useEffect in Signup
    render(<App />, { container });

    // Wait for ProfileSetup screen
    await waitFor(() => expect(screen.getByText(/Set Up Your Profiles/i)).toBeInTheDocument(), { timeout: 3000 });

    // Interact with ProfileSetup
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mother' } });
      fireEvent.change(screen.getByPlaceholderText(/Baby's Name/i), { target: { value: 'Emma' } });
      fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: '2020-01-01' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    // Wait for main App screen and interact with Add User form
    await waitFor(() => {
      expect(screen.getByText(/Aurora Baby/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter a name/i)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter a name/i), { target: { value: 'Luna' } });
      fireEvent.click(screen.getByText(/Add User/i));
    });

    await waitFor(() => expect(screen.getByText('Luna')).toBeInTheDocument(), { timeout: 3000 });
  });
});