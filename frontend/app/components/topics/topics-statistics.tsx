import type { TopicStatistics } from '../../types/topics';

interface TopicsStatisticsProps {
  statistics: TopicStatistics;
}

/**
 * Statistics display component for topics page.
 * Shows aggregated data about topics, favorites, progress, and user wisecoins.
 * Uses consistent styling and provides visual feedback for user progress.
 *
 * @param props - Component props
 * @param props.statistics - Statistics data to display
 */
export function TopicsStatistics({ statistics }: TopicsStatisticsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6 text-sm">
      <StatCard
        value={statistics.totalTopics}
        label="Available Topics"
        color="text-[#FCC822]"
      />
      <StatCard
        value={statistics.favoriteTopics}
        label="My Favorites"
        color="text-red-400"
      />
      <StatCard
        value={statistics.completedTopics}
        label="Completed"
        color="text-green-400"
      />
      <StatCard
        value={`${statistics.totalProgress}%`}
        label="Total Progress"
        color="text-[#FCC822]"
      />
      <WisecoinCard wisecoins={statistics.userWisecoins} />
    </div>
  );
}

interface StatCardProps {
  value: number | string;
  label: string;
  color: string;
}

/**
 * Individual statistic card component.
 * Displays a single statistic with consistent styling.
 */
function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 text-center">
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

interface WisecoinCardProps {
  wisecoins: number;
}

/**
 * Wisecoin display card component.
 * Shows user's wisecoin balance with icon.
 */
function WisecoinCard({ wisecoins }: WisecoinCardProps) {
  return (
    <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-1">
        <img src="/wisecoin/wisecoin.png" alt="Wisecoins" className="h-5 w-5" />
        <div className="text-xl font-semibold text-[#FCC822]">{wisecoins}</div>
      </div>
      <div className="text-gray-400">Your Wisecoins</div>
    </div>
  );
}
