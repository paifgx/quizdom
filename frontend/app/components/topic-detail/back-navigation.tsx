/**
 * Back navigation component providing return functionality.
 * Allows users to navigate back to the previous page.
 */

import React from 'react';
import type { BackNavigationProps } from '../../types/topic-detail';

/**
 * Back navigation button with left arrow icon and text.
 * Provides intuitive navigation back to the previous page.
 *
 * @param props - Navigation properties including back handler
 * @returns JSX element for back navigation
 */
export function BackNavigation({ onBack }: BackNavigationProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-[#FCC822] hover:text-[#FFCD2E] transition-colors font-medium"
      >
        <img src="/buttons/Left.png" alt="Back" className="h-5 w-5" />
        <span>Back</span>
      </button>
    </div>
  );
}
