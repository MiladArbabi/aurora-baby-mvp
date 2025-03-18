// src/tests/App.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../App';

describe('App Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders signup screen initially', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Harmony, Care and Wonder/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
    });
  });

  it('displays users fetched from the backend after login for returning user', async () => {
    localStorage.setItem('token', 'fake-token');
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ _id: '1', name: 'Birk' }) }) // POST /api/profiles
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Birk' }, { _id: '2', name: 'Freya' }] }),
      }) // GET /api/profiles
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // GET /api/users

    const { container } = render(<App />);
    await waitFor(() => expect(screen.getByText(/Set Up Your Profiles/i)).toBeInTheDocument(), { timeout: 3000 });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mother' } });
      fireEvent.change(screen.getByPlaceholderText(/Baby's Name/i), { target: { value: 'Birk' } });
      fireEvent.change(container.querySelector('input[type="date"]') as HTMLInputElement, { target: { value: '2020-01-01' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    await waitFor(() => expect(screen.getByText('Select Your Child')).toBeInTheDocument(), { timeout: 3000 });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Birk' })).toBeInTheDocument(), { timeout: 3000 });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument(); // Updated text
      expect(screen.getByText('Harmony')).toBeInTheDocument(); // Check for a box
    }, { timeout: 3000 });
  });

  it('navigates to home screen after signup and profile selection for new user', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ token: 'fake-token' }) }) // POST /api/register
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ _id: '1', name: 'Emma' }) }) // POST /api/profiles
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ parent: { name: 'Jane' }, children: [{ _id: '1', name: 'Emma' }] }),
      }) // GET /api/profiles
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // GET /api/users

    const { container } = render(<App />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Your name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText(/Your email/i), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Your password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText('Sign Up'));
    });

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
      expect(screen.getByText('Home')).toBeInTheDocument(); // Updated text
      expect(screen.getByText('Harmony')).toBeInTheDocument(); // Check for a box
    }, { timeout: 3000 });
  });
});