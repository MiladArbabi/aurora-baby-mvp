import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Enable DOM matchers
import App from '../components/App';

// Test suite for App component
describe('App Component Tests', () => {
  // Test that the title renders correctly
  it('renders Aurora Baby title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Aurora Baby/i);
    expect(titleElement).toBeInTheDocument(); // Check title is in DOM
  });
});