import { QuizQuestion } from './quiz-question';
import { QuizButton } from './quiz-button';

export interface QuizAnswer {
  id: string;
  text: string;
}

export interface QuizData {
  question: string;
  answers: QuizAnswer[];
}

export interface QuizContainerProps {
  quizData: QuizData;
  selectedAnswer?: string;
  onAnswerSelect: (answerId: string) => void;
  onQuestionClick?: () => void;
  disabled?: boolean;
  showCorrectAnswer?: {
    correct: number;
    selected?: number;
  };
}

/**
 * Main quiz container that combines question display with answer selection grid
 */
export function QuizContainer({
  quizData,
  selectedAnswer,
  onAnswerSelect,
  onQuestionClick,
  disabled = false,
  showCorrectAnswer,
}: QuizContainerProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <QuizQuestion
        question={quizData.question}
        onQuestionClick={onQuestionClick}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        {quizData.answers.map((answer, index) => {
          const isSelected = selectedAnswer === answer.id;
          const isCorrect =
            showCorrectAnswer && index === showCorrectAnswer.correct;
          const isIncorrect =
            showCorrectAnswer &&
            showCorrectAnswer.selected !== undefined &&
            index === showCorrectAnswer.selected &&
            index !== showCorrectAnswer.correct;

          return (
            <div key={answer.id} className="relative">
              <QuizButton
                text={answer.text}
                onClick={() => onAnswerSelect(answer.id)}
                selected={isSelected}
                disabled={disabled}
              />

              {/* Show correct/incorrect indicators */}
              {showCorrectAnswer && (
                <>
                  {isCorrect && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg animate-bounce">
                      ✓
                    </div>
                  )}
                  {isIncorrect && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg animate-pulse">
                      ✗
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
