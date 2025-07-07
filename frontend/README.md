# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## QUIZDOM UI Guidelines

Colors & Usage:

BLUE SHADES:
Darkest Blue: #061421
└── Usage: App-Background, navbar-Background
Dark Blue: #0b2e50
└── Usage: background for buttons
Slightly Less Dark Blue: #06223e
└── Usage: alternative blue shade for accents or refinement

GOLD SHADES:
Light Gold: #fce9a5
└── Usage: font-color for buttons
Gold: #e4ab38
└── Usage: quizdom logo large, quizdom logo small, all borders/ frames

BROWN SHADES:
Brown: #3a2f1b
└── Usage: frames, frames for buttons

Built with ❤️ using React Router.

## API Connection

This frontend connects to a FastAPI backend for data management. The connection is configured as follows:

### Development Setup

1. **Start both frontend and backend:**

   ```bash
   npm run dev:with-backend
   ```

2. **Or start them separately:**

   ```bash
   # Terminal 1 - Backend
   cd ../backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Terminal 2 - Frontend
   npm run dev
   ```

### API Configuration

- **Development**: Uses Vite proxy configuration to route API calls to `http://localhost:8000`
- **Production**: Uses `VITE_API_URL` environment variable (required)
- **Base Path**: All admin API calls use the `/v1/admin` prefix

**Note**: The `VITE_API_URL` environment variable is mandatory in production builds. For Northflank deployment, this is automatically configured to connect to the backend service.

### Health Checks

```bash
# Check if backend is running
npm run api:health

# Check if API endpoints are accessible
npm run api:check
```

### API Endpoints

The frontend connects to the following backend endpoints:

- `GET /v1/admin/topics` - List all topics
- `POST /v1/admin/topics` - Create new topic
- `PUT /v1/admin/topics/{id}` - Update topic
- `DELETE /v1/admin/topics/{id}` - Delete topic
- `GET /v1/admin/questions` - List questions with filters
- `POST /v1/admin/questions` - Create new question
- `PUT /v1/admin/questions/{id}` - Update question
- `DELETE /v1/admin/questions/{id}` - Delete question
- `GET /v1/admin/quizzes` - List quizzes
- `POST /v1/admin/quizzes` - Create new quiz
- `PUT /v1/admin/quizzes/{id}` - Update quiz
- `DELETE /v1/admin/quizzes/{id}` - Delete quiz

### Quiz Gameplay Flow

The frontend provides a complete quiz gameplay experience through the following integration steps:

1. **List Published Quizzes**
   - HTTP GET `/v1/admin/quizzes/published[?topic_id={id}]`
   - Frontend: `gameService.getPublishedQuizzes()`
   - Returns: `{id, title, description, questionCount, difficulty, playCount, topicId}`
   - UI: `QuizSelection` and `AllQuizzesSelection` components

2. **Game Mode Selection**
   - Allowed values: 'solo', 'competitive', 'collaborative'
   - Internally mapped to backend enum ('solo' | 'comp' | 'collab')
   - Conversion handled by `toBackendGameMode()` in `services/game.ts`

3. **Start Game Session**
   - HTTP POST `/v1/game/quiz/{quizId}/start`
   - Body: `{ "mode": "solo|comp|collab" }`
   - Frontend: `gameService.startQuizGame(quizId, mode)`
   - Handles snake_case → camelCase conversion and auth headers

4. **Poll for Players (Competitive/Collaborative)**
   - HTTP GET `/v1/game/session/{sessionId}/status`
   - Frontend: `gameService.getSessionStatus()` (polling every 2 seconds)
   - Used for multiplayer modes to wait for other players

5. **Fetch Questions**
   - HTTP GET `/v1/game/session/{sessionId}/question/{index}`
   - Frontend strategies:
     - Eager: `gameService.getAllQuestionsForSession()` (used in `QuizGamePage`)
     - Lazy: `gameService.getQuestion(sessionId, index)` (used by `useHybridGameFlow`)

6. **Submit Answers**
   - HTTP POST `/v1/game/session/{sessionId}/answer`
   - Body: `{question_id, answer_id, answered_at}` (ms since epoch)
   - Frontend: `gameService.submitAnswer()` or `gameService.submitAnswerWithRequest()`

7. **Track Score and Hearts**
   - Answer response includes `points_earned`, `player_score`, `player_hearts`
   - UI components update based on these values

8. **Complete Session**
   - HTTP POST `/v1/game/session/{sessionId}/complete`
   - Frontend: `gameService.completeSession()` → displays result screen

9. **Join from Invite Link**
   - HTTP POST `/v1/game/session/{sessionId}/join`
   - Frontend: `gameService.joinSession()` (called in route `join.$sessionId.tsx`)

All game-related API calls are centralized in the `gameService` (`services/game.ts`) which handles authentication, proper request formatting, and error handling with localized German messages.

### Authentication

The frontend uses token-based authentication. Ensure you're logged in as an admin user to access the admin features.

### Data Mapping

The frontend automatically maps between backend data structures (using integer IDs and snake_case) and frontend interfaces (using string IDs and camelCase).
