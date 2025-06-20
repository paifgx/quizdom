import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from '../../app/components/ui/loading-skeleton';

describe('LoadingSkeleton', () => {
  it('renders with proper accessibility attributes', () => {
    render(<LoadingSkeleton />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeDefined();
    expect(skeleton.getAttribute('aria-label')).toBe('Laden');
  });

  it('includes screen reader text', () => {
    render(<LoadingSkeleton />);

    const screenReaderText = screen.getByText('Inhalt wird geladen...');
    expect(screenReaderText).toBeDefined();
    expect(screenReaderText.className).toContain('sr-only');
  });

  it('renders with pulse animation', () => {
    render(<LoadingSkeleton />);

    const skeleton = screen.getByRole('status');
    expect(skeleton.className).toContain('animate-pulse');
  });

  it('renders multiple skeleton bars', () => {
    const { container } = render(<LoadingSkeleton />);

    // Count the number of skeleton bars (excluding the screen reader text)
    const skeletonBars = container.querySelectorAll('.bg-gray-200');
    expect(skeletonBars.length).toBeGreaterThan(0);
  });

  it('has proper container structure', () => {
    const { container } = render(<LoadingSkeleton />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer?.className).toContain('animate-pulse');
    expect(mainContainer?.className).toContain('space-y-4');
  });
});
