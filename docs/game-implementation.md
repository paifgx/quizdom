# Quiz Game Implementation

This document describes the implementation of the core quiz game loop for Quizdom, supporting three distinct game modes.

## Game Modes

### 1. Solo Mode

- **Players**: 1
- **Lives**: 3 hearts
- **Time Limit**: None
- **Scoring**:
  - 0-3 seconds → 100 points
  - 3-6 seconds → 50 points
  - > 6 seconds → 0 points
- **Heart Loss**: On wrong answer
- **Game End**: All questions answered OR hearts = 0

### 2. Competitive Mode (1v1)

- **Players**: 2
- **Lives**: 3 hearts per player (individual)
- **Time Limit**: 10 seconds per question
- **Scoring**:
  - First correct → 100 points
  - Second correct within time → 50 points
  - Wrong/timeout → 0 points
- **Heart Loss**: On wrong answer or timeout
- **Game End**: One player's hearts = 0 OR all questions answered
- **Real-time Updates**: Via WebSocket `compUpdate` events

### 3. Collaborative Mode (Team)

- **Players**: 2+
- **Lives**: 3 hearts (shared by team)
- **Time Limit**: 15 seconds per question
- **Scoring**: Same as Solo mode (fastest team answer counts)
- **Heart Loss**: Only if final team answer is wrong or timeout
- **Game End**: Team hearts = 0 OR all questions answered
- **Real-time Updates**: Via WebSocket `collabUpdate` events

## Architecture

### Frontend Components

#### Core Game Components (`frontend/app/components/game/`)

- **`QuizGameContainer`**: Main game orchestrator
- **`TimerBar`**: Countdown timer (turns red in last 3 seconds)
- **`HeartsDisplay`**: Lives indicator with loss animation
- **`ScoreDisplay`**: Score tracker with update animation
- **`GameResultScreen`**: Final score and result display

#### Game State Management (`frontend/app/hooks/useGameState.ts`)

- Handles all game logic and state
- Manages timing, scoring, and lives
- Processes answer submissions
- Determines game over conditions
- Emits events for score updates and heart losses

### Backend API (`backend/app/routers/quiz.py`)

#### Endpoints

- `POST /session/create`: Create new game session
- `GET /session/{id}/question/current`: Get current question with server timestamp
- `POST /session/{id}/answer`: Submit answer and calculate score
- `POST /session/{id}/next`: Move to next question
- `WS /session/{id}/ws/{player_id}`: WebSocket for real-time updates

#### Server-side Features

- Authoritative timing (server timestamps)
- Score calculation based on response time
- Session management
- WebSocket broadcasting for multiplayer modes

## Game Flow

1. **Session Creation**
   - Client requests game session with mode, topic, and players
   - Server creates session and loads questions

2. **Question Display**
   - Server provides question with `show_timestamp`
   - Client starts countdown timer (if applicable)
   - Answer buttons are enabled

3. **Answer Submission**
   - Player selects answer
   - Client sends answer with `answered_at` timestamp
   - Server calculates response time and points
   - Updates scores and hearts

4. **Feedback**
   - Show correct/incorrect indicators
   - Update score with animation
   - Animate heart loss if applicable
   - Disable answer buttons

5. **Next Question**
   - 2-second delay before next question
   - Reset answer states
   - Continue until game end condition

6. **Game Over**
   - Show result screen (Victory/Game Over)
   - Display final score and stars
   - Show wisecoin rewards
   - Options to play again or go back

## WebSocket Events

### Event Types

- `connected`: Initial connection confirmation
- `compUpdate`: Competitive mode player updates
- `collabUpdate`: Collaborative mode team updates
- `gameOver`: Game completion with results

### Event Payloads

```typescript
// Competitive Update
{
  type: "compUpdate",
  players: PlayerState[],
  currentQuestion: number,
  timeRemaining: number
}

// Collaborative Update
{
  type: "collabUpdate",
  teamScore: number,
  teamHearts: number,
  playerAnswers: Record<string, number>,
  currentQuestion: number,
  timeRemaining: number
}

// Game Over
{
  type: "gameOver",
  mode: string,
  result: "win" | "fail",
  score: number,
  heartsRemaining: number
}
```

## UI/UX Features

### Visual Feedback

- ❤️ Heart icons with pulse animation on loss
- Timer bar changes color and pulses in last 3 seconds
- Score updates with floating number animation
- Answer buttons show ✓ for correct, ✗ for incorrect
- Disabled state with greyed appearance

### Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus indicators
- High contrast colors

### Responsive Design

- Mobile-friendly layouts
- Touch-optimized buttons
- Adaptive grid for answer choices

## Future Enhancements

1. **Persistent Sessions**: Use Redis for session storage
2. **Matchmaking**: Automatic player matching for competitive mode
3. **Spectator Mode**: Allow watching ongoing games
4. **Power-ups**: Special abilities in competitive/collaborative modes
5. **Leaderboards**: Global and topic-specific rankings
6. **Achievements**: Unlock badges for game milestones
