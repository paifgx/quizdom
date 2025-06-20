import { useEffect, useState } from 'react';
import type {
  TopicFilters,
  SortOption,
  DifficultyLevel,
} from '../../types/topics';
import { fetchCategories, fetchDifficultyNames } from '../../api';
import { translate } from '../../utils/translations';

interface TopicsFiltersProps {
  filters: TopicFilters;
  showFilters: boolean;
  onUpdateFilters: (updates: Partial<TopicFilters>) => void;
  onToggleFilters: () => void;
}

/**
 * Filter controls component for topics page.
 * Provides search, category, difficulty, and sorting options.
 * Handles filter state management and user interactions.
 *
 * @param props - Component props
 * @param props.filters - Current filter state
 * @param props.showFilters - Whether advanced filters are visible
 * @param props.onUpdateFilters - Callback to update filters
 * @param props.onToggleFilters - Callback to toggle filter visibility
 */
export function TopicsFilters({
  filters,
  showFilters,
  onUpdateFilters,
  onToggleFilters,
}: TopicsFiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [difficultyNames, setDifficultyNames] = useState<DifficultyLevel[]>([]);
  const [loading, setLoading] = useState(true);

  // Load filter data
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [categoriesData, difficultyData] = await Promise.all([
          fetchCategories(),
          fetchDifficultyNames(),
        ]);
        setCategories(categoriesData);
        setDifficultyNames(difficultyData);
      } catch {
        // Error intentionally ignored
      } finally {
        setLoading(false);
      }
    };

    loadFilterData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 bg-opacity-30 rounded-xl p-4 mb-8 border border-gray-700/50">
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FCC822]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-30 rounded-xl p-4 mb-8 border border-gray-700/50">
      <div className="flex flex-col gap-4">
        <SearchAndToggleRow
          searchTerm={filters.searchTerm}
          showFilters={showFilters}
          onSearchChange={value => onUpdateFilters({ searchTerm: value })}
          onToggleFilters={onToggleFilters}
        />

        {showFilters && (
          <AdvancedFilters
            filters={filters}
            onUpdateFilters={onUpdateFilters}
            categories={categories}
            difficultyNames={difficultyNames}
          />
        )}
      </div>
    </div>
  );
}

interface SearchAndToggleRowProps {
  searchTerm: string;
  showFilters: boolean;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
}

/**
 * Search bar and filter toggle button row.
 * Provides main search functionality and filter visibility control.
 */
function SearchAndToggleRow({
  searchTerm,
  showFilters,
  onSearchChange,
  onToggleFilters,
}: SearchAndToggleRowProps) {
  return (
    <div className="flex gap-2">
      <div className="flex-grow">
        <input
          type="text"
          id="search"
          placeholder={translate('topics.searchTopics')}
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
        />
      </div>
      <div className="flex items-center">
        <button
          onClick={onToggleFilters}
          className={`px-3 py-2.5 rounded-lg border transition-colors duration-200 ${
            showFilters
              ? 'bg-[#FCC822] border-[#FCC822] text-gray-900'
              : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:border-[#FCC822] hover:text-[#FCC822]'
          }`}
          title={
            showFilters
              ? translate('nav.hideFilters')
              : translate('nav.showFilters')
          }
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline">
              {translate('topics.filters')}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

interface AdvancedFiltersProps {
  filters: TopicFilters;
  onUpdateFilters: (updates: Partial<TopicFilters>) => void;
  categories: string[];
  difficultyNames: DifficultyLevel[];
}

/**
 * Advanced filter controls for category, difficulty, and sorting.
 * Provides dropdown selections for detailed topic filtering.
 */
function AdvancedFilters({
  filters,
  onUpdateFilters,
  categories,
  difficultyNames,
}: AdvancedFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
      <FilterSelect
        id="category"
        label={translate('topics.category')}
        value={filters.category}
        onChange={value => onUpdateFilters({ category: value })}
        options={[
          { value: 'all', label: translate('topics.allCategories') },
          ...categories.map(category => ({ value: category, label: category })),
        ]}
      />

      <FilterSelect
        id="difficulty"
        label={translate('topics.difficulty')}
        value={filters.difficulty}
        onChange={value => onUpdateFilters({ difficulty: value })}
        options={[
          { value: 'all', label: translate('topics.allDifficulties') },
          ...difficultyNames.map(difficulty => ({
            value: difficulty,
            label: difficulty,
          })),
        ]}
      />

      <FilterSelect
        id="sort"
        label={translate('topics.sortBy')}
        value={filters.sortBy}
        onChange={value => onUpdateFilters({ sortBy: value as SortOption })}
        options={[
          { value: 'popularity', label: translate('topics.popularity') },
          { value: 'difficulty', label: translate('topics.difficultySort') },
          { value: 'title', label: translate('topics.title') },
          { value: 'progress', label: translate('topics.progress') },
        ]}
      />
    </div>
  );
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

/**
 * Reusable select dropdown component for filters.
 * Provides consistent styling and accessibility for filter options.
 */
function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-300 font-medium mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
