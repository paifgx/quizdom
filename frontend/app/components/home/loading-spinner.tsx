/**
 * Loading spinner component for home page authentication check.
 * Displays a centered spinner with consistent styling.
 * Prevents content flicker during authentication state transitions.
 */
export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822]"></div>
    </div>
  );
}
