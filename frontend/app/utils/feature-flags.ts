/**
 * Feature flags for gradual rollout of new features.
 * Can be controlled via environment variables or backend config.
 */

interface FeatureFlags {
  // Enable curated quiz gameplay
  enableQuizMode: boolean;
  // Enable dynamic topic-based gameplay
  enableTopicMode: boolean;
  // Show quiz publishing UI in admin
  enableQuizPublishing: boolean;
  // Enable multiplayer features
  enableMultiplayer: boolean;
  // Show achievement system
  enableAchievements: boolean;
}

// Default feature flags - can be overridden by env vars
const defaultFlags: FeatureFlags = {
  enableQuizMode: true,
  enableTopicMode: true,
  enableQuizPublishing: true,
  enableMultiplayer: false,
  enableAchievements: false,
};

/**
 * Get current feature flags.
 * In production, these could come from a backend endpoint.
 */
export function getFeatureFlags(): FeatureFlags {
  if (import.meta.env.DEV) {
    // In development, enable all features
    return {
      enableQuizMode: true,
      enableTopicMode: true,
      enableQuizPublishing: true,
      enableMultiplayer: true,
      enableAchievements: true,
    };
  }

  // In production, use environment variables or defaults
  return {
    enableQuizMode:
      import.meta.env.VITE_ENABLE_QUIZ_MODE === 'true' ||
      defaultFlags.enableQuizMode,
    enableTopicMode:
      import.meta.env.VITE_ENABLE_TOPIC_MODE === 'true' ||
      defaultFlags.enableTopicMode,
    enableQuizPublishing:
      import.meta.env.VITE_ENABLE_QUIZ_PUBLISHING === 'true' ||
      defaultFlags.enableQuizPublishing,
    enableMultiplayer:
      import.meta.env.VITE_ENABLE_MULTIPLAYER === 'true' ||
      defaultFlags.enableMultiplayer,
    enableAchievements:
      import.meta.env.VITE_ENABLE_ACHIEVEMENTS === 'true' ||
      defaultFlags.enableAchievements,
  };
}

/**
 * Check if a specific feature is enabled.
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}
