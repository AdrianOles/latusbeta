export type gameType = {
    date?: string;
    league?: string;
    location?: string;
    notes: string;
    home: {
        name: string;
        score: number | null;
    };
    visitor: {
        name: string;
        score: number | null;
    }
    sets?: { // Optional field for game sets
        home: number[] | undefined;
        visitor: number[] | undefined;
    };
    time?: string
}

export interface Sets {
    home: number[];
    visitor: number[];
}