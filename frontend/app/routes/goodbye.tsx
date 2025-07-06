import React from 'react';
import { Link } from 'react-router';
import { translate } from '../utils/translations';

export function meta() {
  return [
    { title: translate('goodbye.pageTitle') },
    { name: 'description', content: translate('goodbye.pageDescription') },
  ];
}

/**
 * Goodbye page displayed after account deletion.
 *
 * Simple page without authentication requirements.
 * Provides a friendly farewell message and navigation back to home.
 */
export default function GoodbyePage() {
  return (
    <div className="min-h-screen bg-[#061421] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-[#FCC822] mb-4">
            {translate('goodbye.title')}
          </h1>

          <p className="text-gray-300 text-lg mb-8">
            {translate('goodbye.message')}
          </p>

          <Link
            to="/"
            className="inline-block bg-[#FCC822] text-[#061421] px-6 py-3 rounded-lg font-medium hover:bg-[#e6b81f] transition-colors"
          >
            {translate('goodbye.homeButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}
