import { translate } from '../../utils/translations';

/**
 * Header component for the topics page.
 * Displays the main title and description with German content.
 * Provides consistent styling and accessibility.
 */
export function TopicsHeader() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
        {translate('topics.overview')}
      </h1>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        {translate('topics.overviewDescription')}
      </p>
    </div>
  );
}
