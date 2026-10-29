import { Profile } from './friend.model';
import { Artwork } from './artwork.model';

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

export interface HungGift {
  gift: Gift;
  artwork: Artwork;
}

export interface GiftedArtwork {
  memoryId: number;
  artworkId: number;
}