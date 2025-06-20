import React from 'react';

/**
 * Header component for the topics page.
 * Displays the main title and description with English content.
 * Provides consistent styling and accessibility.
 */
export function TopicsHeader() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
        Topics Overview
      </h1>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        Discover exciting topics from various categories and test your
        knowledge.
      </p>
    </div>
  );
}
