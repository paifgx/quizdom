/**
 * Header for the bookmarked questions section.
 *
 * Displays the count of bookmarked questions and a button to clear them.
 */
export function QuestionsHeader({
  bookmarkedCount,
  onClearBookmarks,
  hasBookmarks,
}: {
  bookmarkedCount: number;
  onClearBookmarks: () => void;
  hasBookmarks: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-white">
        Markierte Fragen: {bookmarkedCount}
      </h2>
      {hasBookmarks && (
        <button
          onClick={onClearBookmarks}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          title="Alle markierten Fragen löschen"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Alle löschen
        </button>
      )}
    </div>
  );
}
