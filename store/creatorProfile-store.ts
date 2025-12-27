import { create } from "zustand";

type MainFilter = "Rafflers" | "Auctions" | "Gumballs";
type RafflerFilter = "created" | "purchased" | "favourite" ;
type ActiveTab = "created" | "purchased" | "favourite";

interface CreatorProfileState {
  mainFilter: MainFilter;
  setMainFilter: (tab: MainFilter) => void;

  rafflerFilter: RafflerFilter;
  setRafflerFilter: (value: RafflerFilter) => void;

  activeRafflerTab: ActiveTab;
  setActiveRafflerTab: (value: ActiveTab) => void;

  enabled: boolean;
  setEnabled: (value: boolean) => void;
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
}));
