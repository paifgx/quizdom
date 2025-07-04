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
  waitingForOpponent?: boolean;
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
  waitingForOpponent = false,
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

      {/* Waiting for opponent overlay */}
      {waitingForOpponent && (
        <div className="mt-6 bg-gray-800/80 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-[#FCC822] animate-spin"></div>
            <p className="text-white font-medium">Warte auf Mitspieler...</p>
          </div>
        </div>
      )}
    </div>
  );
}
