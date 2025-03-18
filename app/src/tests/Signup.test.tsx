// src/tests/Signup.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import Signup from '../components/auth/Signup';

describe('Signup Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders signup form initially', () => {
    render(<Signup onAuthSuccess={jest.fn()} />);
    expect(screen.getByText(/Welcome to Aurora Baby/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('submits signup and shows success message', async () => {
    const onAuthSuccess = jest.fn();
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-token' }),
    });

    render(<Signup onAuthSuccess={onAuthSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Your email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(screen.getByText(/Successfully registered jane@example\.com/i)).toBeInTheDocument();
      expect(onAuthSuccess).toHaveBeenCalledWith(true);
      expect(localStorage.getItem('token')).toBe('fake-token');
    });
  });

  it('displays error message on signup failure', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Signup failed' }),
    });

    render(<Signup onAuthSuccess={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Your email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(screen.getByText('Signup failed')).toBeInTheDocument();
    });
  });
});