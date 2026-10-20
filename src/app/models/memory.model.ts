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

export type NewMemory = Omit<Memory, 'id'>;

// --------------------------------------------------
// INTERFACE
// --------------------------------------------------

export interface Memory {
    readonly id: string;
    title: string;
    date: string;
    mood: Mood;
    door: DoorStyle;
    text: string;
    artworks: number[];
}
