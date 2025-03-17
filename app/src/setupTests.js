// Setup file for Jest to extend testing capabilities
import '@testing-library/jest-dom'; // Add DOM matchers to Jest
import fetch from 'node-fetch';     // Import node-fetch for polyfill

// Polyfill fetch globally if not defined
global.fetch = global.fetch || fetch;