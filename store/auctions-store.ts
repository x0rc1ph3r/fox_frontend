import { create } from "zustand"
import { AucationsData } from "../data/aucations-data"

interface State {
  aucations: typeof AucationsData
  setAucations: (data: typeof AucationsData) => void
  filter: string
  setFilter: (filter: string) => void

    enabled1: boolean;
  enabled2: boolean;
  isOpen: boolean;

  setEnabled1: (value: boolean) => void;
  setEnabled2: (value: boolean) => void;

  openModal: () => void;
  closeModal: () => void;


    endDate: Date | null;
  hours: number | null;
  setEndDate: (date: Date) => void;
  setHours: (hrs: number) => void;
}

export const useAuctionsStore = create<State>((set) => ({
  aucations: AucationsData, 
  setAucations: (data) => set({ aucations: data }),
  filter: "All Auctions",
  setFilter: (filter) => set({ filter }),   

    enabled1: false,
  enabled2: false,
  isOpen: false,

  setEnabled1: (value) => set({ enabled1: value }),
  setEnabled2: (value) => set({ enabled2: value }),

  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),

  

    endDate: null,
  hours: null,
  setEndDate: (date) => set({ endDate: date }),
  setHours: (hrs) => set({ hours: hrs }),
}))


