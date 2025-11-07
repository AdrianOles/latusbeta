export type gameType = {
    date?: string;
    league: string;
    location: string;
    notes: string;
    home: {
        name: string;
        score: number | null;
    };
    visitor: {
        name: string;
        score: number | null;
    }
    time?: string
}