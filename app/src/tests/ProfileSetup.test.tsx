import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

describe('ProfileSetup Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn((file: File) => `mock-url/${file.name}`);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders profile setup form with clickable avatars', () => {
    render(<ProfileSetupScreen onComplete={() => {}} />);
    expect(screen.getByText(/Set Up Your Profiles/i)).toBeInTheDocument();
    expect(screen.getByText(/Parent Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Child Information/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Baby's Name/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByTestId('child-date-of-birth')).toBeInTheDocument();
    expect(screen.getByTestId('parent-avatar-input')).toBeInTheDocument();
    expect(screen.getByTestId('child-avatar-input')).toBeInTheDocument();
    expect(screen.getByTestId('parent-avatar')).toHaveAttribute('title', 'Edit avatar');
    expect(screen.getByTestId('child-avatar')).toHaveAttribute('title', 'Edit avatar');
  });

  it('uploads parent avatar successfully', async () => {
    render(<ProfileSetupScreen onComplete={() => {}} />);
    const file = new File(['dummy'], 'parent.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('parent-avatar-input');
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    await waitFor(() => {
      expect(screen.getByTestId('parent-avatar')).toHaveAttribute('data-src', 'mock-url/parent.jpg');
    });
  });

  it('uploads child avatar successfully', async () => {
    render(<ProfileSetupScreen onComplete={() => {}} />);
    const file = new File(['dummy'], 'child.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('child-avatar-input');
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    await waitFor(() => {
      expect(screen.getByTestId('child-avatar')).toHaveAttribute('data-src', 'mock-url/child.jpg');
    });
  });

  it('submits profile setup successfully with all fields', async () => {
    const mockOnComplete = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
    );
    
    localStorage.setItem('token', 'fake-token');
    render(<ProfileSetupScreen onComplete={mockOnComplete} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Your Relationship:'), { target: { value: 'Mother' } });
      fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText(/Baby's Name/i), { target: { value: 'Emma' } });
      fireEvent.change(screen.getByTestId('child-date-of-birth'), { target: { value: '2023-01-01' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/profiles',
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
            parentAvatar: null,
            childAvatar: null,
          }),
        })
      );
    });
  });

  it('displays error when API request fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('API failed')));
    localStorage.setItem('token', 'fake-token');
    render(<ProfileSetupScreen onComplete={() => {}} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Your Relationship:'), { target: { value: 'Mother' } });
      fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText(/Baby's Name/i), { target: { value: 'Emma' } });
      fireEvent.change(screen.getByTestId('child-date-of-birth'), { target: { value: '2023-01-01' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });
    await waitFor(() => {
      expect(screen.getByText('API failed')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});