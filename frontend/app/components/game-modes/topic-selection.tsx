import React from 'react';
import { TopicCard } from './topic-card';
import type { Topic, GameMode } from '../../types/game';

interface TopicSelectionProps {
  topics: Topic[];
  selectedTopicId: string | null;
  selectedModeData: GameMode | null;
  onTopicSelect: (topicId: string) => void;
}

/**
 * Renders the topic selection section with current mode context and topic cards.
 * Displays the selected game mode name and grid of available topics.
 * Handles topic selection through individual card components.
 *
 * @param props - Component props
 * @param props.topics - Available topics to display
 * @param props.selectedTopicId - Currently selected topic ID
 * @param props.selectedModeData - Data for the selected game mode
 * @param props.onTopicSelect - Callback when a topic is selected
 */
export function TopicSelection({
  topics,
  selectedTopicId,
  selectedModeData,
  onTopicSelect,
}: TopicSelectionProps) {
  return (
    <div>
      <ModeContext selectedModeData={selectedModeData} />
      <TopicGrid
        topics={topics}
        selectedTopicId={selectedTopicId}
        onTopicSelect={onTopicSelect}
      />
    </div>
  );
}

interface ModeContextProps {
  selectedModeData: GameMode | null;
}

/**
 * Displays the context of which mode is being played.
 */
function ModeContext({ selectedModeData }: ModeContextProps) {
  return (
    <div className="mb-6">
      <p className="text-gray-400 text-center">
        Playing{' '}
        <span className="text-[#FCC822] font-medium">
          {selectedModeData?.name}
        </span>
      </p>
    </div>
  );
}

interface TopicGridProps {
  topics: Topic[];
  selectedTopicId: string | null;
  onTopicSelect: (topicId: string) => void;
}

/**
 * Renders the grid of topic cards.
 */
function TopicGrid({ topics, selectedTopicId, onTopicSelect }: TopicGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {topics.map(topic => (
        <TopicCard
          key={topic.id}
          topic={topic}
          isSelected={selectedTopicId === topic.id}
          onSelect={onTopicSelect}
        />
      ))}
    </div>
  );
}
