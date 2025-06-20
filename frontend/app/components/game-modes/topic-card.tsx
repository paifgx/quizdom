import type { Topic } from '../../types/game';
import { handleKeyDown } from '../../utils/keyboard';

interface TopicCardProps {
  topic: Topic;
  isSelected: boolean;
  onSelect: (topicId: string) => void;
}

/**
 * Displays a selectable topic card with question count and hover effects.
 * Provides visual feedback for selection state and accessibility support.
 * Includes error handling for image loading and proper ARIA attributes.
 *
 * @param props - Component props
 * @param props.topic - The topic data to display
 * @param props.isSelected - Whether this topic is currently selected
 * @param props.onSelect - Callback function when topic is selected
 */
export function TopicCard({ topic, isSelected, onSelect }: TopicCardProps) {
  const handleSelect = () => onSelect(topic.id);

  return (
    <div
      className={`group relative cursor-pointer transform transition-all duration-300 hover:scale-105 ${
        isSelected ? 'scale-105' : ''
      }`}
      onClick={handleSelect}
      onKeyDown={e => handleKeyDown(e, handleSelect)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select ${topic.title} topic with ${topic.totalQuestions} questions`}
    >
      <div
        className={`bg-gray-800/70 rounded-xl overflow-hidden border-2 transition-all duration-300 backdrop-blur-sm ${
          isSelected
            ? 'border-[#FCC822] shadow-lg shadow-[#FCC822]/25'
            : 'border-gray-600 hover:border-[#FCC822]/50'
        }`}
      >
        <TopicImage topic={topic} />
        <TopicTitle topic={topic} />
        {isSelected && <SelectionIndicator />}
      </div>
    </div>
  );
}

interface TopicImageProps {
  topic: Topic;
}

/**
 * Renders the topic image with hover overlay, question count badge, and fallback handling.
 */
function TopicImage({ topic }: TopicImageProps) {
  return (
    <div className="relative h-40 w-full">
      <img
        src={topic.image}
        alt={topic.title}
        className="w-full h-full object-cover"
        onError={e => {
          e.currentTarget.src = '/badges/badge_book_1.png';
        }}
      />

      <HoverOverlay topic={topic} />
      <QuestionCountBadge count={topic.totalQuestions} />
    </div>
  );
}

interface HoverOverlayProps {
  topic: Topic;
}

/**
 * Renders the hover description overlay for the topic card.
 */
function HoverOverlay({ topic }: HoverOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
      <div className="text-center p-3">
        <p className="text-white text-xs font-medium">{topic.description}</p>
      </div>
    </div>
  );
}

interface QuestionCountBadgeProps {
  count: number;
}

/**
 * Renders the question count badge overlay.
 */
function QuestionCountBadge({ count }: QuestionCountBadgeProps) {
  return (
    <div className="absolute bottom-3 left-3 bg-gray-900/80 text-white px-2 py-1 rounded-full text-xs">
      {count} questions
    </div>
  );
}

interface TopicTitleProps {
  topic: Topic;
}

/**
 * Renders the topic title section.
 */
function TopicTitle({ topic }: TopicTitleProps) {
  return (
    <div className="p-4 text-center">
      <h3 className="text-lg font-bold text-[#FCC822]">{topic.title}</h3>
    </div>
  );
}

/**
 * Renders the selection indicator icon.
 */
function SelectionIndicator() {
  return (
    <div className="absolute top-3 right-3 bg-[#FCC822] text-gray-900 rounded-full p-2">
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
