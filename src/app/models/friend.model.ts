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

export function isWaitingForMe(friend: Friend): boolean {
  return friend.status === 'pending' && !friend.sentByMe;
}