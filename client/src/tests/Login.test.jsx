import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/Login';

describe('Login Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state during login attempt', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => ({ token: 'fake-token' }) }), 100)));
    render(<Login onLogin={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(screen.getByText('Logging in...')).toBeDisabled();
    await waitFor(() => expect(screen.queryByText('Logging in...')).not.toBeInTheDocument());
  });
});