/**
 * Topic statistics component displaying comprehensive topic information.
 * Shows topic image, description, stars, difficulty, and wisecoin reward.
 */

import React from 'react';
import type { TopicStatsProps } from '../../types/topic-detail';
import { getDifficultyName } from '../../data/topic-detail-data';

/**
 * Displays topic statistics including difficulty stars, completion status, and wisecoin reward.
 * Provides visual representation of topic difficulty and progress metrics.
 *
 * @param props - Component properties including topic data
 * @returns JSX element for topic statistics section
 */
export function TopicStats({ topic }: TopicStatsProps) {
  return (
    <div className="flex flex-col items-start lg:items-end space-y-2">
      <DifficultyStars stars={topic.stars} />
      <DifficultyText stars={topic.stars} />
      <CompletionStatus
        completed={topic.completedQuestions}
        total={topic.totalQuestions}
      />
      <WisecoinReward reward={topic.wisecoinReward} />
    </div>
  );
}

interface DifficultyStarsProps {
  /** Number of stars representing difficulty (1-5) */
  stars: number;
}

/**
 * Difficulty stars component displaying visual difficulty rating.
 * Shows filled and empty stars based on topic difficulty level.
 *
 * @param props - Stars properties including star count
 * @returns JSX element for difficulty stars
 */
function DifficultyStars({ stars }: DifficultyStarsProps) {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, index) => (
        <img
          key={index}
          src={index < stars ? '/stars/star_full.png' : '/stars/star_empty.png'}
          alt={`Star ${index + 1}`}
          className="h-6 w-6 lg:h-8 lg:w-8"
        />
      ))}
    </div>
  );
}

interface DifficultyTextProps {
  /** Number of stars for difficulty calculation */
  stars: number;
}

/**
 * Difficulty text component displaying human-readable difficulty level.
 * Converts star rating to descriptive difficulty name.
 *
 * @param props - Difficulty properties including star count
 * @returns JSX element for difficulty text
 */
function DifficultyText({ stars }: DifficultyTextProps) {
  return (
    <div className="text-sm text-gray-400">
      Difficulty: {getDifficultyName(stars)}
    </div>
  );
}

interface CompletionStatusProps {
  /** Number of completed questions */
  completed: number;
  /** Total number of questions */
  total: number;
}

/**
 * Completion status component displaying progress information.
 * Shows completed vs total questions count.
 *
 * @param props - Completion properties including counts
 * @returns JSX element for completion status
 */
function CompletionStatus({ completed, total }: CompletionStatusProps) {
  return (
    <div className="text-sm text-gray-400">
      {completed}/{total} Questions
    </div>
  );
}

interface WisecoinRewardProps {
  /** Wisecoin reward amount */
  reward: number;
}

/**
 * Wisecoin reward component displaying reward information.
 * Shows visual representation of available rewards.
 *
 * @param props - Reward properties including amount
 * @returns JSX element for wisecoin reward
 */
function WisecoinReward({ reward }: WisecoinRewardProps) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <img src="/wisecoin/wisecoin.png" alt="Wisecoins" className="h-4 w-4" />
      <span className="text-[#FCC822] font-medium">{reward} Wisecoin</span>
    </div>
  );
}
