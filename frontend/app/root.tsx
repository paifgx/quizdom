import React from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
} from 'react-router';

import { AuthProvider } from './contexts/auth';
import { BackgroundProvider } from './contexts/background';
import { useReturnMessage } from './hooks/useReturnMessage';
import { translate } from './utils/translations';
import './app.css';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Tiny5:wght@400&display=swap',
  },
  {
    rel: 'icon',
    href: '/logo/favicon.ico',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  useReturnMessage();

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BackgroundProvider>
        <Outlet />
      </BackgroundProvider>
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = translate('errors.oops');
  let details = translate('errors.somethingWentWrong');
  let stack: string | undefined;

  if (
    isRouteErrorResponse(error) ||
    (error && typeof (error as { status?: number }).status === 'number')
  ) {
    message =
      (error as { status: number }).status === 404
        ? '404'
        : translate('errors.error');
    details =
      (error as { status: number }).status === 404
        ? translate('errors.pageNotFound')
        : (error as { statusText?: string }).statusText || details;
  } else if (
    process.env.NODE_ENV !== 'production' &&
    error &&
    error instanceof Error
  ) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="min-h-screen bg-[#061421] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <img
            src="/logo/Logo_Quizdom_transparent.png"
            alt="Quizdom Logo"
            className="h-32 w-32 mx-auto opacity-80"
          />
        </div>
        <h1 className="text-4xl font-bold text-[#FCC822] mb-4">{message}</h1>
        <p className="text-gray-300 text-lg mb-8">{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto bg-gray-800 rounded-lg text-left text-sm">
            <code className="text-gray-300">{stack}</code>
          </pre>
        )}
        <a
          href="/"
          className="btn-gradient inline-block px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 mt-4"
        >
          {translate('errors.goHome')}
        </a>
      </div>
    </div>
  );
}
