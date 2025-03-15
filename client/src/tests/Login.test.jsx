import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/Login';

// Mock firebase/auth
jest.mock('firebase/auth', () => {
  const mockGoogleAuthProvider = () => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  });
  return {
    signInWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: function () {
      return mockGoogleAuthProvider();
    },
  };
});

// Mock ../firebase
jest.mock('../firebase', () => ({
  auth: {},
}));

describe('Login Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { signInWithEmailAndPassword, signInWithPopup } = require('firebase/auth');
    signInWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('fake-token') },
    });
    signInWithPopup.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('google-token') },
    });
  });

  it('shows loading state during email login', async () => {
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
      expect(onLogin).toHaveBeenCalled();
    });
  });

  it('initiates Google login with custom client ID', async () => {
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} />);
    fireEvent.click(screen.getByText(/Sign in with Google/i));
    await waitFor(() => expect(onLogin).toHaveBeenCalled());
  });

  it('initiates Apple login with mock', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'apple-token' }),
    });
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} />);
    fireEvent.click(screen.getByText(/Sign in with Apple/i));
    await waitFor(() => expect(onLogin).toHaveBeenCalled());
  });
});