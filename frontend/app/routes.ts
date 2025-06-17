import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Main routes
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  
  // Player routes
  route("quizzes", "routes/quizzes.tsx"),
  route("game-modes", "routes/game-modes.tsx"),
  route("progress", "routes/progress.tsx"),
  route("profile", "routes/profile.tsx"),
  
  // Admin routes
  route("admin/dashboard", "routes/admin.dashboard.tsx"),
  route("admin/questions", "routes/admin.questions.tsx"),
  route("admin/users", "routes/admin.users.tsx"),
  route("admin/logs", "routes/admin.logs.tsx"),
  
  // Error pages
  route("403", "routes/403.tsx"),
  route("404", "routes/404.tsx"),
] satisfies RouteConfig;
