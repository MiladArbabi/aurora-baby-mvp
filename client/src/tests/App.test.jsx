import { render, screen } from '@testing-library/react';
import App from '../components/App';

describe('App Component Tests', () => {
  it('renders Aurora Baby title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Aurora Baby/i);
    expect(titleElement).toBeInTheDocument();
  });
});