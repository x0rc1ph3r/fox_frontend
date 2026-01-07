import { create } from "zustand";

type MainFilter = "Rafflers" | "Auctions" | "Gumballs";
type RafflerFilter = "created" | "purchased" | "favourite" ;
type ActiveTab = "created" | "purchased" | "favourite";
type SortOption = "newest" | "oldest" | "price_high" | "price_low" | "ending_soon" | "unclaimed_winner";

interface CreatorProfileState {
  mainFilter: MainFilter;
  setMainFilter: (tab: MainFilter) => void;

  rafflerFilter: RafflerFilter;
  setRafflerFilter: (value: RafflerFilter) => void;

  activeRafflerTab: ActiveTab;
  setActiveRafflerTab: (value: ActiveTab) => void;

  enabled: boolean;
  setEnabled: (value: boolean) => void;

  sortOption: SortOption;
  setSortOption: (value: SortOption) => void;
}

export const useCreatorProfileStore = create<CreatorProfileState>((set) => ({
  mainFilter: "Rafflers",
  setMainFilter: (tab) => set({ mainFilter: tab }),

  rafflerFilter: "created",
  setRafflerFilter: (value) => set({ rafflerFilter: value }),

  activeRafflerTab: "created",
  setActiveRafflerTab: (value) => set({ activeRafflerTab: value }),

  enabled: false,
  setEnabled: (value) => set({ enabled: value }),

  sortOption: "newest",
  setSortOption: (value) => set({ sortOption: value }),
}));
