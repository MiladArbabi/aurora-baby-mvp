// client/src/tests/Signup.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Define mockAuth first
const mockAuth = {};

// Mock firebase/auth
jest.mock('firebase/auth', () => {
  const mockGoogleAuthProvider = () => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  });
  return {
    sendSignInLinkToEmail: jest.fn(),
    isSignInWithEmailLink: jest.fn(),
    signInWithEmailLink: jest.fn(),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: function () {
      return mockGoogleAuthProvider();
    },
  };
});

// Mock ../firebase with mockAuth
jest.mock('../firebase', () => ({ auth: mockAuth }));

describe('Signup Component Tests', () => {
  let Signup;

  beforeAll(async () => {
    const module = await import('../components/Signup');
    Signup = module.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    const { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithPopup } = require('firebase/auth');
    sendSignInLinkToEmail.mockResolvedValue();
    isSignInWithEmailLink.mockReturnValue(false);
    signInWithEmailLink.mockResolvedValue({
      user: { getIdToken: () => 'fake-token' },
    });
    signInWithPopup.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('google-token') },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Ensure mocks are cleaned up
  });

  it('renders signup options initially', () => {
    render(<Signup />);
    expect(screen.getByText(/Welcome to Aurora Baby/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
    expect(screen.getByText('Sign Up with Email')).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Apple/i)).toBeInTheDocument();
  });

  it('sends email link and shows confirmation message', async () => {
    const onAuthSuccess = jest.fn();
    render(<Signup onAuthSuccess={onAuthSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('Your email'), { target: { value: 'jane@example.com' } });
    fireEvent.click(screen.getByText('Sign Up with Email'));
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Please follow the instructions in the email sent to jane@example\.com/i)).toBeInTheDocument();
      expect(screen.queryByText('Sign Up with Email')).not.toBeInTheDocument();
    });
  });

  it('completes email link sign-in on redirect', async () => {
    const { isSignInWithEmailLink, signInWithEmailLink } = require('firebase/auth');
    isSignInWithEmailLink.mockReturnValue(true);
    window.localStorage.setItem('emailForSignIn', 'jane@example.com');
    const onAuthSuccess = jest.fn();
    render(<Signup onAuthSuccess={onAuthSuccess} />);
    await waitFor(() => {
      expect(signInWithEmailLink).toHaveBeenCalledWith(mockAuth, 'jane@example.com', window.location.href);
      expect(onAuthSuccess).toHaveBeenCalledWith(true);
      expect(localStorage.getItem('token')).toBe('fake-token');
    });
  });

  it('initiates Google signup and calls onAuthSuccess', async () => {
    const onAuthSuccess = jest.fn();
    render(<Signup onAuthSuccess={onAuthSuccess} />);
    fireEvent.click(screen.getByText(/Sign in with Google/i));
    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalledWith(true);
      expect(localStorage.getItem('token')).toBe('google-token');
    });
  });

  it('initiates Apple signup and calls onAuthSuccess', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'apple-token' }),
    });
    const onAuthSuccess = jest.fn();
    render(<Signup onAuthSuccess={onAuthSuccess} />);
    fireEvent.click(screen.getByText(/Sign in with Apple/i));
    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalledWith(true);
      expect(localStorage.getItem('token')).toBe('apple-token');
    });
  });

  it('displays error message on email link failure', async () => {
    const { sendSignInLinkToEmail } = require('firebase/auth');
    sendSignInLinkToEmail.mockRejectedValue(new Error('Email send failed'));
    // Suppress console.error for this specific test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<Signup />);
    fireEvent.change(screen.getByPlaceholderText('Your email'), { target: { value: 'jane@example.com' } });
    fireEvent.click(screen.getByText('Sign Up with Email'));
    await waitFor(() => {
      expect(screen.getByText('Email send failed')).toBeInTheDocument();
    });
    console.error.mockRestore(); // Restore after test
  });
});