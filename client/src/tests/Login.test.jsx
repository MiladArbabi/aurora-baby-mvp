import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/Login';

// Mock Firebase entirely
jest.mock('../firebase', () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn()
  }
}));

// Mock GoogleAuthProvider separately
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn()
  })),
  signInWithEmailAndPassword: jest.fn(), // Ensure these are mocked too
  signInWithPopup: jest.fn()
}));

describe('Login Component Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows loading state during email login', async () => {
    const mockUserCredential = { user: { getIdToken: () => Promise.resolve('fake-token') } };
    require('../firebase').auth.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
    render(<Login onLogin={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Logging in...')).not.toBeInTheDocument());
  });

  it('initiates Google login with custom client ID', async () => {
    const mockUserCredential = { user: { getIdToken: () => Promise.resolve('google-token') } };
    require('../firebase').auth.signInWithPopup.mockResolvedValue(mockUserCredential);
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} />);
    fireEvent.click(screen.getByText(/Sign in with Google/i));
    await waitFor(() => expect(onLogin).toHaveBeenCalled());
  });

  it('initiates Apple login with mock', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ token: 'apple-token' }) });
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} />);
    fireEvent.click(screen.getByText(/Sign in with Apple/i));
    await waitFor(() => expect(onLogin).toHaveBeenCalled());
  });
});