import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '@/App';

describe('App smoke test', () => {
  it('should render the header with application title', () => {
    render(<App />);
    const heading = screen.getByRole('heading', {
      name: /career intelligence assistant/i,
      level: 1,
    });
    expect(heading).toBeDefined();
  });

  it('should render the documents section', () => {
    render(<App />);
    const docsHeading = screen.getByRole('heading', { 
      name: /^documents$/i,
      level: 2,
    });
    expect(docsHeading).toBeDefined();
  });

  it('should render the assistant section', () => {
    render(<App />);
    const assistantHeading = screen.getByRole('heading', {
      name: /^assistant$/i,
      level: 2,
    });
    expect(assistantHeading).toBeDefined();
  });

  it('should display the application description', () => {
    render(<App />);
    const description = screen.getByText(
      /understand how your professional experience aligns with job opportunities/i
    );
    expect(description).toBeDefined();
  });
});
