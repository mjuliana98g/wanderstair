import { Mood } from './memory.model';
import { Profile } from './friend.model';

// --------------------------------------------------
// INTERFACES
// --------------------------------------------------

export interface NewPostcard {
    recipientId: string;
    memoryId: number;
    artworkId: number;
    message: string;
    memoryTitle: string;
    memoryDate: string;
    moods: Mood[];
}

export interface Postcard extends NewPostcard {
    id: number;
    createdAt: string;
    readAt: string | null;
    sender: Profile;
    recipient: Profile;
    sentByMe: boolean;
}