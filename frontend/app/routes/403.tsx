import { Link } from 'react-router';

export function meta() {
  return [
    { title: '403 - Zugriff verweigert | Quizdom' },
    { name: 'description', content: 'Sie haben keine Berechtigung für diese Seite.' },
  ];
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#061421] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/logo/Logo_Quizdom_transparent.png"
            alt="Quizdom Logo"
            className="h-32 w-32 mx-auto opacity-80"
          />
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-[#FCC822] mb-4">403</h1>
          <h2 className="text-2xl font-bold text-white mb-4">
            Zugriff verweigert
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Sie haben keine Berechtigung, auf diese Seite zuzugreifen. 
            Diese Funktion ist nur für Administratoren verfügbar.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            to="/"
            className="btn-gradient inline-block px-6 py-3 rounded-lg text-base font-medium transition-all duration-200"
          >
            Zur Startseite
          </Link>
          <div className="text-sm text-gray-400">
            <p>
              Falls Sie glauben, dass dies ein Fehler ist, wenden Sie sich an den Administrator.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 opacity-30">
          <div className="flex justify-center space-x-4">
            <img
              src="/buttons/Home.png"
              alt=""
              className="h-8 w-8"
            />
            <img
              src="/buttons/Settings.png"
              alt=""
              className="h-8 w-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 