import type { TopicFilters, SortOption } from '../../types/topics';
import { categories, difficultyNames } from '../../data/topics-data';

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
          placeholder="Search topics..."
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
          title={showFilters ? 'Hide filters' : 'Show filters'}
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
            <span className="hidden sm:inline">Filters</span>
          </div>
        </button>
      </div>
    </div>
  );
}

interface AdvancedFiltersProps {
  filters: TopicFilters;
  onUpdateFilters: (updates: Partial<TopicFilters>) => void;
}

/**
 * Advanced filter controls for category, difficulty, and sorting.
 * Provides dropdown selections for detailed topic filtering.
 */
function AdvancedFilters({ filters, onUpdateFilters }: AdvancedFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
      <FilterSelect
        id="category"
        label="Category"
        value={filters.category}
        onChange={value => onUpdateFilters({ category: value })}
        options={[
          { value: 'all', label: 'All Categories' },
          ...categories.map(category => ({ value: category, label: category })),
        ]}
      />

      <FilterSelect
        id="difficulty"
        label="Difficulty"
        value={filters.difficulty}
        onChange={value => onUpdateFilters({ difficulty: value })}
        options={[
          { value: 'all', label: 'All Difficulties' },
          ...difficultyNames.map(difficulty => ({
            value: difficulty,
            label: difficulty,
          })),
        ]}
      />

      <FilterSelect
        id="sort"
        label="Sort by"
        value={filters.sortBy}
        onChange={value => onUpdateFilters({ sortBy: value as SortOption })}
        options={[
          { value: 'popularity', label: 'Popularity' },
          { value: 'difficulty', label: 'Difficulty' },
          { value: 'title', label: 'Title' },
          { value: 'progress', label: 'Progress' },
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
