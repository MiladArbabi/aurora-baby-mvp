import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ProfileSetup from '../components/ProfileSetup';

describe('ProfileSetup Component Tests', () => {
  it('renders profile setup form', () => {
    render(<ProfileSetup onComplete={() => {}} />);
    expect(screen.getByText(/Set Up Your Profiles/i)).toBeInTheDocument();
  });

  it('submits profile setup successfully', async () => {
    const mockOnComplete = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true })
    );
    render(<ProfileSetup onComplete={mockOnComplete} />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Child's Name/i), { target: { value: 'Emma' } });
      fireEvent.change(screen.getByLabelText(/Your Relationship/i), { target: { value: 'Mother' } });
      fireEvent.change(screen.getByRole('textbox', { type: 'date' }), { target: { value: '2023-01-01' } });
      fireEvent.click(screen.getByText(/Continue/i));
    });
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});