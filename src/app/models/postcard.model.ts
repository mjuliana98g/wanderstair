import { Mood } from './memory.model';
import { Profile } from './friend.model';

export interface NewPostcard {
    recipientId: string;
    memoryId: number;
    artworkId: number;
    message: string;
    memoryTitle: string;
    memoryDate: string;
    moods: Mood[];
    replyTo?: number | null;
}

export interface Postcard extends NewPostcard {
    id: number;
    createdAt: string;
    readAt: string | null;
    sender: Profile;
    recipient: Profile;
    sentByMe: boolean;
    replyTo: number | null;
}