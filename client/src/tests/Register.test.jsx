import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../components/Register';

describe('Register Component Tests', () => {
  it('registers a user successfully', async () => {
    const mockOnRegister = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-token' })
    });
    render(<Register onRegister={mockOnRegister} />);
    fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(mockOnRegister).toHaveBeenCalled();
    });
  });

  it('displays an error message on failed registration', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'User already exists' })
    });
    render(<Register onRegister={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });
});