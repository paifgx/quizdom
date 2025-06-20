import React from 'react';

interface LiveRegionProps {
  text: string;
}

/**
 * Accessibility component for screen reader announcements.
 * Provides live region updates for dynamic content changes.
 * Hidden visually but available to assistive technologies.
 *
 * @param props - Component props
 * @param props.text - The text to announce to screen readers
 */
export function LiveRegion({ text }: LiveRegionProps) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  );
}
