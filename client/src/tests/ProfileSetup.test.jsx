import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ProfileSetup from '../components/ProfileSetup';

describe('ProfileSetup Component Tests', () => {
  let container;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    ({ container } = render(<ProfileSetup onComplete={() => {}} />));
  });

  it('renders profile setup form with clickable avatars', () => {
    expect(screen.getByText(/Set Up Your Profiles/i)).toBeInTheDocument();
    expect(screen.getByText(/Parent Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Child Information/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Baby's Name/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument();
    expect(screen.getByTestId('parent-avatar-input')).toBeInTheDocument();
    expect(screen.getByTestId('child-avatar-input')).toBeInTheDocument();
  });

  it('uploads parent avatar successfully', async () => {
    const file = new File(['dummy'], 'parent.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('parent-avatar-input');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByTestId('parent-avatar')).toHaveAttribute('data-src', expect.stringContaining('parent.jpg'));
    });
  });

  it('uploads child avatar successfully', async () => {
    const file = new File(['dummy'], 'child.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('child-avatar-input');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByTestId('child-avatar')).toHaveAttribute('data-src', expect.stringContaining('child.jpg'));
    });
  });
  
  it('renders profile setup form with parent and child sections', () => {
    expect(screen.getByText(/Set Up Your Profiles/i)).toBeInTheDocument();
    expect(screen.getByText(/Parent Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Child Information/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Baby's Name/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // Relationship dropdown
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument(); // Birthdate
  });

  it('submits profile setup successfully with all fields', async () => {
    const mockOnComplete = jest.fn();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    localStorage.setItem('token', 'fake-token');
    render(<ProfileSetup onComplete={mockOnComplete} />, { container });
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mother' } });
      fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText(/Baby's Name/i), { target: { value: 'Emma' } });
      fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: '2023-01-01' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profiles',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            relationship: 'Mother',
            parentName: 'Jane',
            childName: 'Emma',
            dateOfBirth: '2023-01-01',
          }),
        })
      );
    });
  });

  it('displays error when API request fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('API failed')));
    localStorage.setItem('token', 'fake-token');
    render(<ProfileSetup onComplete={() => {}} />, { container });
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mother' } });
      fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText(/Baby's Name/i), { target: { value: 'Emma' } });
      fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: '2023-01-01' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });
    await waitFor(() => {
      expect(screen.getByText('API failed')).toBeInTheDocument();
    });
  });
});