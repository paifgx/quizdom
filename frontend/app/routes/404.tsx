import { Link } from 'react-router';

export function meta() {
  return [
    { title: '404 - Seite nicht gefunden | Quizdom' },
    {
      name: 'description',
      content: 'Die angeforderte Seite konnte nicht gefunden werden.',
    },
  ];
}

export default function NotFoundPage() {
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
          <h1 className="text-6xl font-bold text-[#FCC822] mb-4">404</h1>
          <h2 className="text-2xl font-bold text-white mb-4">
            Seite nicht gefunden
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Die Seite, die Sie suchen, konnte nicht gefunden werden. Sie wurde
            möglicherweise verschoben, gelöscht oder Sie haben eine falsche URL
            eingegeben.
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
              Oder verwenden Sie die Navigation oben, um zu anderen Bereichen zu
              gelangen.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 opacity-30">
          <div className="flex justify-center space-x-4">
            <img src="/buttons/Home.png" alt="" className="h-8 w-8" />
            <img src="/buttons/Left.png" alt="" className="h-8 w-8" />
            <img src="/buttons/Right.png" alt="" className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
