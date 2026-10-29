export type FriendshipStatus = 'pending' | 'accepted';

export interface Profile {
  id: string;
  name: string;
}

export interface Friend {
  friendshipId: number;
  id: string;
  name: string;
  status: FriendshipStatus;
  sentByMe: boolean;
}