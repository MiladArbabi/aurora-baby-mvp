// src/tests/App.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../App';

// Mock Firebase auth functions
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
  let fetchMock: jest.Mock;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    const { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } = require('firebase/auth');
    sendSignInLinkToEmail.mockResolvedValue(undefined);
    isSignInWithEmailLink.mockReturnValue(false);
    signInWithEmailLink.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('fake-token') },
    });

    // Define fetchMock as a Jest mock function
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders signup screen initially', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Aurora Baby/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Your email/i)).toBeInTheDocument();
    });
  });

  it('displays users fetched from the backend after login for returning user', async () => {
    localStorage.setItem('token', 'fake-token');

    // Mock fetch calls for profile setup and selection
    fetchMock
      // Mock POST /api/profiles for profile setup
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: '1', name: 'Birk' }),
      })
      // Mock GET /api/profiles for profile selection
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          parent: { name: 'Jane' },
          children: [{ _id: '1', name: 'Birk' }, { _id: '2', name: 'Freya' }],
        }),
      })
      // Mock GET /api/users (if called by App.tsx useEffect)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

    const { container } = render(<App />);

    // Simulate profile setup for a returning user who hasn’t completed it in this test run
    await waitFor(() => expect(screen.getByText(/Set Up Your Profiles/i)).toBeInTheDocument(), { timeout: 3000 });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mother' } });
      fireEvent.change(screen.getByPlaceholderText(/Baby's Name/i), { target: { value: 'Birk' } });
      fireEvent.change(container.querySelector('input[type="date"]') as HTMLInputElement, { target: { value: '2020-01-01' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    // Wait for ProfileSelectionScreen
    await waitFor(() => expect(screen.getByText('Select Your Child')).toBeInTheDocument(), { timeout: 3000 });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Birk' })).toBeInTheDocument(), { timeout: 3000 });

    // Select a child and continue
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    // Verify navigation to HomeScreen
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Welcome to your Aurora Baby home screen!')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('navigates to home screen after email link setup and profile selection for new user', async () => {
    const { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } = require('firebase/auth');

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ _id: '1', name: 'Emma' }) }) // POST /api/profiles
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Emma' }] }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // GET /api/users

    const { container } = render(<App />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Your email/i), { target: { value: 'jane@example.com' } });
      fireEvent.click(screen.getByText(/Sign Up with Email/i));
    });

    await waitFor(() => expect(screen.getByText(/Please follow the instructions in the email sent to jane@example\.com/i)).toBeInTheDocument());

    isSignInWithEmailLink.mockReturnValue(true);
    render(<App />, { container });

    await waitFor(() => expect(screen.getByText(/Set Up Your Profiles/i)).toBeInTheDocument(), { timeout: 3000 });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mother' } });
      fireEvent.change(screen.getByPlaceholderText(/Baby's Name/i), { target: { value: 'Emma' } });
      fireEvent.change(container.querySelector('input[type="date"]') as HTMLInputElement, { target: { value: '2020-01-01' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    await waitFor(() => expect(screen.getByText(/Select Your Child/i)).toBeInTheDocument(), { timeout: 3000 });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Welcome to your Aurora Baby home screen!')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});