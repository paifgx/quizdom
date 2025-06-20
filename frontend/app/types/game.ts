/**
 * Game-related type definitions for the quiz application.
 * Defines interfaces for game modes, topics, and related data structures.
 */

export interface GameMode {
  id: 'solo' | 'duel' | 'team';
  name: string;
  description: string;
  icon: string;
}

export interface Topic {
  id: string;
  title: string;
  totalQuestions: number;
  image: string;
  description: string;
}

export type GameStep = 'mode' | 'topic';
export type GameModeId = GameMode['id'];
