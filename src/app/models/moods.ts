import { DoorStyle, Mood } from './memory.model';

export interface MoodFamily {
  name: string;
  moods: Mood[];
}

export const MOOD_FAMILIES: MoodFamily[] = [
  { name: 'Bright', moods: ['happy', 'excited', 'grateful', 'proud', 'loved', 'hopeful', 'playful'] },
  { name: 'Quiet', moods: ['calm', 'relieved', 'content', 'inspired', 'curious'] },
  { name: 'Heavy', moods: ['sad', 'lonely', 'anxious', 'tired', 'overwhelmed', 'disappointed'] },
  { name: 'Stormy', moods: ['angry', 'frustrated', 'jealous', 'scared'] },
  { name: 'Mixed', moods: ['nostalgic', 'bittersweet', 'confused', 'surprised'] }
];

export const DOOR_STYLES: DoorStyle[] = ['arch', 'round', 'double', 'iron', 'starry'];

export function familyOf(mood: Mood): string {
  const family = MOOD_FAMILIES.find((family) => family.moods.includes(mood));
  return family ? family.name.toLowerCase() : 'mixed';
}