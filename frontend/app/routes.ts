import {
  type RouteConfig,
  index,
  route,
  layout,
} from '@react-router/dev/routes';

export default [
  // Authentication routes (no main nav)
  layout('layouts/auth-layout.tsx', [
    route('/login', 'routes/auth.tsx', { id: 'auth-login' }),
    route('/signup', 'routes/auth.tsx', { id: 'auth-signup' }),
    route('/forgot-password', 'routes/forgot-password.tsx'),
  ]),

  // Main application routes (with nav and background)
  layout('layouts/main-layout.tsx', [
    // Dashboard-style pages (with shared sidebar)
    layout('layouts/dashboard-layout.tsx', [
      index('routes/home.tsx'),
      route('/topics/:topicId', 'routes/topic-detail.tsx'),
    ]),

    // Other main routes (without dashboard sidebar)
    route('/topics', 'routes/topics.tsx'),
    route('/game-modes', 'routes/game-modes.tsx'),
    route('/progress', 'routes/progress.tsx'),
    route('/profile', 'routes/profile.tsx'),

    // Admin routes
    route('/admin/dashboard', 'routes/admin.dashboard.tsx'),
    route('/admin/questions', 'routes/admin.questions.tsx'),
    route('/admin/users', 'routes/admin.users.tsx'),
    route('/admin/logs', 'routes/admin.logs.tsx'),
  ]),

  // Error pages (standalone)
  route('/403', 'routes/403.tsx'),
  route('/404', 'routes/404.tsx'),
] satisfies RouteConfig;
