import { create } from 'zustand';
import { Announcement, AttachInput } from '../API';

interface temp {
    title: string;
}

export interface AnnouncementTransformed extends Omit<Announcement, 'attachments'> {
    attachments: (AttachInput[] | null)[] | null | undefined;
}

interface useStore {
    fetched: boolean;
    filterState: "all" | "new" | "ending" | "upcoming" | "created";
    announcements: AnnouncementTransformed[] | null;
    currentIndex: number;
    setAnnouncements: (anouncements: AnnouncementTransformed[]) => void
    setCurrentIndex: (id: number) => void
    setFetch: (state: boolean) => void
    setFilterState: (state: "all" | "new" | "ending" | "upcoming" | "created") => void
}

const useAnnouncements = create<useStore>((set) => ({
    fetched: false,
    announcements: null,
    filterState: "all",
    setAnnouncements: (announcements) => set({ announcements }),
    currentIndex: 0,
    setCurrentIndex: (index) => set({ currentIndex: index }),
    setFetch: (state) => set({ fetched: state }),
    setFilterState: (state) => set({ filterState: state })
}));

export default useAnnouncements;
