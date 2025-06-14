# 9-Slice Quiz Components

Reusable React components for creating pixel-art styled quiz interfaces using 9-slice scaling technique with Tailwind CSS.

## Components

### `NineSlicePanel`
Base component that renders a 9-slice scaled panel with pixel-art styling using Tailwind classes.

```tsx
import { NineSlicePanel } from './components/nine-slice-quiz';

<NineSlicePanel onClick={() => console.log('clicked')}>
  <p>Your content here</p>
</NineSlicePanel>
```

### `QuizQuestion`
Specialized component for displaying quiz questions with optimized styling.

```tsx
import { QuizQuestion } from './components/nine-slice-quiz';

<QuizQuestion 
  question="What is the capital of France?"
  onQuestionClick={() => console.log('Question clicked')}
/>
```

### `QuizButton`
Interactive button component for quiz answers with hover and selection states.

```tsx
import { QuizButton } from './components/nine-slice-quiz';

<QuizButton
  text="Paris"
  onClick={() => handleAnswer('paris')}
  selected={selectedAnswer === 'paris'}
  disabled={isQuizComplete}
/>
```

### `QuizContainer`
Main container that orchestrates the entire quiz interface with responsive grid.

```tsx
import { QuizContainer } from './components/nine-slice-quiz';
import type { QuizData } from './components/nine-slice-quiz';

const quizData: QuizData = {
  question: "What is the capital of France?",
  answers: [
    { id: "paris", text: "Paris" },
    { id: "london", text: "London" },
    { id: "berlin", text: "Berlin" },
    { id: "madrid", text: "Madrid" }
  ]
};

<QuizContainer
  quizData={quizData}
  selectedAnswer={selectedAnswer}
  onAnswerSelect={(answerId) => setSelectedAnswer(answerId)}
  onQuestionClick={() => console.log('Question clicked')}
/>
```

## Styling

All styling is handled through Tailwind CSS classes. The components use:

- **Grid Layout**: CSS Grid for 9-slice structure and responsive button layout
- **Custom Colors**: Pixel-art color palette with custom color values
- **Transitions**: Smooth hover and interaction effects
- **Responsive Design**: Adapts from 1 column on mobile to 2 columns on desktop

### Required Tailwind Configuration

Make sure your `tailwind.config.js` includes the font family for the pixel art theme:

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['Press Start 2P', 'monospace'],
      }
    }
  }
}
```

## Features

- **9-slice scaling**: Maintains pixel-perfect borders at any size
- **Tailwind-first**: No custom CSS required, uses utility classes
- **Responsive design**: Mobile-first approach with `md:` breakpoints
- **Accessibility**: Includes focus states and keyboard navigation
- **Interactive states**: Hover, active, selected, and disabled states
- **TypeScript support**: Full type definitions included
- **Clean architecture**: Follows single responsibility principle

## Folder Structure

```
components/
├── nine-slice-quiz/
│   ├── index.ts                 # Component exports
│   ├── nine-slice-panel.tsx     # Base 9-slice panel
│   ├── quiz-question.tsx        # Question display
│   ├── quiz-button.tsx          # Answer button
│   ├── quiz-container.tsx       # Main container
│   └── README.md               # This file
└── index.ts                    # Re-exports
```

## Migration from CSS Version

The components have been converted from custom CSS to Tailwind:

- **No CSS imports needed**: All styling is handled via Tailwind classes
- **Same visual appearance**: Maintains the exact pixel-art aesthetic
- **Better maintainability**: Easier to customize and extend
- **Smaller bundle**: No separate CSS file to load 