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
    // Home route - handles both landing page and dashboard
    index('routes/home.tsx'),

    // Dashboard-style pages (with shared sidebar) - only for authenticated users
    layout('layouts/dashboard-layout.tsx', [
      route('/topics/:topicId', 'routes/topic-detail.tsx'),
      route('/topics/:topicId/questions/:questionId', 'routes/quiz.tsx'),
    ]),

    // Other main routes (without dashboard sidebar)
    route('/topics/:topicId/quiz-game', 'routes/quiz-game.tsx'),
    route('/test-game', 'routes/test-game.tsx'),  // Test route for game API integration
    route('/topics', 'routes/topics.tsx'),
    route('/game-modes', 'routes/game-modes.tsx'),
    route('/progress', 'routes/progress.tsx'),
    route('/profile', 'routes/profile.tsx'),
    route('/user-manual', 'routes/user-manual.tsx'),

    // Admin routes
    route('/admin/dashboard', 'routes/admin.dashboard.tsx'),
    route('/admin/questions', 'routes/admin.questions.tsx'),
    route('/admin/questions/:questionId', 'routes/admin.question-edit.tsx'),
    route('/admin/quizzes', 'routes/admin.quizzes.tsx'),
    route('/admin/quizzes/:quizId', 'routes/admin.quiz-edit.tsx'),
    route('/admin/users', 'routes/admin.users.tsx'),
    route('/admin/logs', 'routes/admin.logs.tsx'),
  ]),

  // Error pages (standalone)
  route('/403', 'routes/403.tsx'),
  route('/404', 'routes/404.tsx'),
] satisfies RouteConfig;
