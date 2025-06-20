/**
 * Loading component specifically for the home page
 * Matches the app's dark theme and branding
 */
export function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#061421] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
        <p className="text-gray-300 text-lg">Laden...</p>
      </div>
    </div>
  );
}
