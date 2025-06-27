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
- **Production**: Uses `VITE_API_URL` environment variable or defaults to `http://localhost:8000`
- **Base Path**: All admin API calls use the `/v1/admin` prefix

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

### Authentication

The frontend uses token-based authentication. Ensure you're logged in as an admin user to access the admin features.

### Data Mapping

The frontend automatically maps between backend data structures (using integer IDs and snake_case) and frontend interfaces (using string IDs and camelCase).
