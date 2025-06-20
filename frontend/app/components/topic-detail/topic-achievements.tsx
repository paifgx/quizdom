/**
 * Topic achievements component displaying user progress badges.
 * Shows unlocked and locked achievements with visual indicators.
 */

import React from 'react';
import type { TopicAchievementsProps } from '../../types/topic-detail';
import { translate } from '../../utils/translations';

/**
 * Displays achievement badges with unlock status indicators.
 * Provides visual feedback for user progress and accomplishments.
 *
 * @param props - Component properties including achievement data
 * @returns JSX element for achievements section
 */
export function TopicAchievements({ achievements }: TopicAchievementsProps) {
  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-sm font-semibold text-gray-400">
        {translate('dashboard.achievements')}
      </h3>
      <div className="flex items-center space-x-2 lg:space-x-3 flex-wrap gap-2">
        {achievements.map(achievement => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}

interface AchievementBadgeProps {
  /** Achievement data to display */
  achievement: TopicAchievementsProps['achievements'][0];
}

/**
 * Individual achievement badge component with unlock status.
 * Displays achievement icon with appropriate opacity based on unlock status.
 *
 * @param props - Badge properties including achievement data
 * @returns JSX element for achievement badge
 */
function AchievementBadge({ achievement }: AchievementBadgeProps) {
  return (
    <img
      src={achievement.image}
      alt={achievement.name}
      className={`h-6 w-6 lg:h-8 lg:w-8 transition-opacity duration-200 ${
        achievement.isUnlocked ? 'opacity-100' : 'opacity-40'
      }`}
      title={achievement.name}
    />
  );
}
