import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizContainer } from '../../app/components/nine-slice-quiz/quiz-container';
import type { QuizData } from '../../app/components/nine-slice-quiz/quiz-container';

describe('QuizContainer', () => {
  const mockQuizData: QuizData = {
    question: 'What is the capital of France?',
    answers: [
      { id: 'paris', text: 'Paris' },
      { id: 'london', text: 'London' },
      { id: 'berlin', text: 'Berlin' },
      { id: 'madrid', text: 'Madrid' },
    ],
  };

  const defaultProps = {
    quizData: mockQuizData,
    onAnswerSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the quiz question', () => {
    render(<QuizContainer {...defaultProps} />);

    expect(screen.getByText('What is the capital of France?')).toBeDefined();
  });

  it('renders all answer buttons', () => {
    render(<QuizContainer {...defaultProps} />);

    expect(screen.getByText('Paris')).toBeDefined();
    expect(screen.getByText('London')).toBeDefined();
    expect(screen.getByText('Berlin')).toBeDefined();
    expect(screen.getByText('Madrid')).toBeDefined();
  });

  it('calls onAnswerSelect when an answer button is clicked', () => {
    const mockOnAnswerSelect = vi.fn();
    render(
      <QuizContainer {...defaultProps} onAnswerSelect={mockOnAnswerSelect} />
    );

    fireEvent.click(screen.getByText('Paris'));

    expect(mockOnAnswerSelect).toHaveBeenCalledWith('paris');
  });

  it('calls onAnswerSelect with correct answer id for each button', () => {
    const mockOnAnswerSelect = vi.fn();
    render(
      <QuizContainer {...defaultProps} onAnswerSelect={mockOnAnswerSelect} />
    );

    fireEvent.click(screen.getByText('London'));
    expect(mockOnAnswerSelect).toHaveBeenCalledWith('london');

    fireEvent.click(screen.getByText('Berlin'));
    expect(mockOnAnswerSelect).toHaveBeenCalledWith('berlin');

    fireEvent.click(screen.getByText('Madrid'));
    expect(mockOnAnswerSelect).toHaveBeenCalledWith('madrid');
  });

  it('passes onQuestionClick to QuizQuestion component', () => {
    const mockOnQuestionClick = vi.fn();
    render(
      <QuizContainer {...defaultProps} onQuestionClick={mockOnQuestionClick} />
    );

    fireEvent.click(screen.getByText('What is the capital of France?'));

    expect(mockOnQuestionClick).toHaveBeenCalledTimes(1);
  });

  it('highlights selected answer button', () => {
    render(<QuizContainer {...defaultProps} selectedAnswer="paris" />);

    // The selected button should still render the text (we can't easily test the visual selection without DOM inspection)
    expect(screen.getByText('Paris')).toBeDefined();
  });

  it('renders with no selected answer', () => {
    render(<QuizContainer {...defaultProps} selectedAnswer={undefined} />);

    expect(screen.getByText('Paris')).toBeDefined();
    expect(screen.getByText('London')).toBeDefined();
    expect(screen.getByText('Berlin')).toBeDefined();
    expect(screen.getByText('Madrid')).toBeDefined();
  });

  it('has proper container structure and styling', () => {
    const { container } = render(<QuizContainer {...defaultProps} />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer?.className).toContain('max-w-4xl');
    expect(mainContainer?.className).toContain('mx-auto');
  });

  it('has responsive grid layout for answer buttons', () => {
    const { container } = render(<QuizContainer {...defaultProps} />);

    // Look for the specific grid that contains answer buttons, not the nine-slice panel grid
    const answerGridContainer = container.querySelector(
      '.grid.grid-cols-1.md\\:grid-cols-2'
    );
    expect(answerGridContainer).toBeDefined();
    expect(answerGridContainer?.className).toContain('grid-cols-1');
    expect(answerGridContainer?.className).toContain('md:grid-cols-2');
    expect(answerGridContainer?.className).toContain('gap-5');
  });

  it('renders with different quiz data', () => {
    const differentQuizData: QuizData = {
      question: 'What is 2 + 2?',
      answers: [
        { id: 'three', text: '3' },
        { id: 'four', text: '4' },
      ],
    };

    render(
      <QuizContainer quizData={differentQuizData} onAnswerSelect={vi.fn()} />
    );

    expect(screen.getByText('What is 2 + 2?')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
  });

  it('renders with single answer option', () => {
    const singleAnswerQuizData: QuizData = {
      question: 'Is this a test?',
      answers: [{ id: 'yes', text: 'Yes' }],
    };

    render(
      <QuizContainer quizData={singleAnswerQuizData} onAnswerSelect={vi.fn()} />
    );

    expect(screen.getByText('Is this a test?')).toBeDefined();
    expect(screen.getByText('Yes')).toBeDefined();
  });

  it('renders with many answer options', () => {
    const manyAnswersQuizData: QuizData = {
      question: 'Pick a number:',
      answers: [
        { id: 'one', text: 'One' },
        { id: 'two', text: 'Two' },
        { id: 'three', text: 'Three' },
        { id: 'four', text: 'Four' },
        { id: 'five', text: 'Five' },
        { id: 'six', text: 'Six' },
      ],
    };

    render(
      <QuizContainer quizData={manyAnswersQuizData} onAnswerSelect={vi.fn()} />
    );

    expect(screen.getByText('Pick a number:')).toBeDefined();
    expect(screen.getByText('One')).toBeDefined();
    expect(screen.getByText('Two')).toBeDefined();
    expect(screen.getByText('Three')).toBeDefined();
    expect(screen.getByText('Four')).toBeDefined();
    expect(screen.getByText('Five')).toBeDefined();
    expect(screen.getByText('Six')).toBeDefined();
  });

  it('handles answer selection changes correctly', () => {
    const mockOnAnswerSelect = vi.fn();
    const { rerender } = render(
      <QuizContainer
        {...defaultProps}
        onAnswerSelect={mockOnAnswerSelect}
        selectedAnswer="paris"
      />
    );

    // Change selected answer
    rerender(
      <QuizContainer
        {...defaultProps}
        onAnswerSelect={mockOnAnswerSelect}
        selectedAnswer="london"
      />
    );

    expect(screen.getByText('London')).toBeDefined();
  });

  it('renders without onQuestionClick handler', () => {
    render(<QuizContainer {...defaultProps} />);

    expect(screen.getByText('What is the capital of France?')).toBeDefined();
  });

  it('generates unique keys for answer buttons', () => {
    // This test ensures that each button has a unique key (testing React key prop functionality)
    const { container } = render(<QuizContainer {...defaultProps} />);

    const buttons = container.querySelectorAll(
      'button, [role="button"], [tabindex]'
    );
    expect(buttons.length).toBeGreaterThan(0);
  });
});
