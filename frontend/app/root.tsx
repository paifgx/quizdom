import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { AuthProvider } from "./contexts/auth";
import { useReturnMessage } from "./hooks/useReturnMessage";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Tiny5:wght@400&display=swap",
  },
  {
    rel: "icon",
    href: "/logo/favicon.ico",
  }
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
      <Outlet />
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
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
          Zur Startseite
        </a>
      </div>
    </div>
  );
}
