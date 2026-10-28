import { Profile } from './friend.model';

// --------------------------------------------------
// INTERFACES
// --------------------------------------------------

export interface NewGift {
  postcardId: number;
  memoryId: number;
  artworkId: number;
  note: string;
}

export interface Gift extends NewGift {
  id: number;
  createdAt: string;
  giver: Profile;
}