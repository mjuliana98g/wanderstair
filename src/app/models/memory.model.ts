// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type Mood =
  | 'happy' | 'excited' | 'grateful' | 'proud' | 'loved' | 'hopeful' | 'playful'
  | 'calm' | 'relieved' | 'content' | 'inspired' | 'curious'
  | 'sad' | 'lonely' | 'anxious' | 'tired' | 'overwhelmed' | 'disappointed'
  | 'angry' | 'frustrated' | 'jealous' | 'scared'
  | 'nostalgic' | 'bittersweet' | 'confused' | 'surprised';

export type DoorStyle = 'arch' | 'round' | 'double' | 'iron' | 'starry';

export interface Memory {
  readonly id: number;
  title: string;
  date: string;
  moods: Mood[];
  door: DoorStyle;
  text: string;
  artworks: number[];
}

export interface NewMemory {
  title: string;
  date: string;
  text: string;
  moodIds: number[];
  doorId: number;
}

export interface MoodOption {
  id: number;
  name: string;
  family: string;
}

export interface DoorOption {
  id: number;
  name: string;
  description: string;
}