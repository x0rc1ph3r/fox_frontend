import { VerifiedTokens } from "@/utils/verifiedTokens";
import { calculateRent } from "hooks/helpers";
import { create } from "zustand";

/* ----------------------------- Types ----------------------------- */

export type GumballTab = "setup" | "loadPrizes" | "buySettings" | "studio";
export type StartType = "manual" | "schedule";
export type DurationPreset = "24hr" | "36hr" | "48hr" | "72hr" | null;
export type StudioTab = "sold" | "available";
export type PrizeCategory = "nft" | "token";

export interface GumballPrize {
  id: string;
  category: PrizeCategory;
  mint: string;
  amount: number;
  quantity: number;
  name?: string;
  image?: string;
  symbol?: string;
  decimals?: number;
  floorPrice?: number;
}

export interface LoadedPrize {
  publicKey: string;
  gumballId: number;
  prizeIndex: number;
  ifPrizeNft: boolean;
  mint: string;
  totalAmount: number;
  prizeAmount: number;
  quantity: number;
}

export interface GumballData {
  id: number;
  name: string;
  creator: string;
  startTime: number;
  endTime: number;
  totalTickets: number;
  soldTickets: number;
  ticketPrice: number;
  isTicketSol: boolean;
  ticketMint: string | null;
  status: "pending" | "active" | "ended" | "cancelled";
  prizes: GumballPrize[];
}

interface GumballState {
  // ======================= UI States =======================
  activeTab: GumballTab;
  studioTab: StudioTab;
  isCreateTokenModalOpen: boolean;
  isAddNftModalOpen: boolean;
  isAddTokenModalOpen: boolean;
  isAdvancedSettingsOpen: boolean;
  isCreatingGumball: boolean;
  isLoadingPrizes: boolean;
  createdGumballId: number;

  // ======================= Gumball Setup =======================
  // Basic Info
  name: string;

  // Start Type
  startType: StartType;

  // Date & Time (for scheduled start)
  startDate: Date | null;
  startTimeHour: string;
  startTimeMinute: string;
  startTimePeriod: "AM" | "PM";

  // Duration
  selectedDuration: DurationPreset;
  endDate: Date | null;
  endTimeHour: string;
  endTimeMinute: string;
  endTimePeriod: "AM" | "PM";

  // Ticket Configuration
  prizeCount: string;
  ticketPrice: string;
  ticketPricePerSol: string;
  isTicketSol: boolean;
  ticketCurrency: {
    symbol: string;
    address: string;
  };

  // Computed Values
  rent: number;

  // ======================= Load Prizes =======================
  prizes: GumballPrize[];
  loadedPrizes: LoadedPrize[];
  totalPrizeValue: number;
  maxProceeds: number;
  totalPrizesLoaded:number; 
  // ======================= Buy Back Settings =======================
  buyBackEnabled: boolean;
  buyBackPercentage: number;
  buyBackEscrowBalance: number;

  // ======================= Gumball Studio =======================
  currentGumballId: number | null;
  currentGumball: GumballData | null;

  // ======================= Advanced Settings =======================
  holderOnlyEnabled: boolean;
  holderOnlyCollection: string;
  additionalCollections: string[];

  // ======================= Terms =======================
  agreedToTerms: boolean;

  // ======================= Actions - UI =======================
  setActiveTab: (tab: GumballTab) => void;
  setStudioTab: (tab: StudioTab) => void;
  openCreateTokenModal: () => void;
  closeCreateTokenModal: () => void;
  openAddNftModal: () => void;
  closeAddNftModal: () => void;
  openAddTokenModal: () => void;
  closeAddTokenModal: () => void;
  toggleAdvancedSettings: () => void;
  setAdvancedSettingsOpen: (open: boolean) => void;
  setIsCreatingGumball: (isCreating: boolean) => void;
  setIsLoadingPrizes: (isLoading: boolean) => void;

  // ======================= Actions - Gumball Setup =======================
  setName: (name: string) => void;
  setStartType: (type: StartType) => void;
  setCreatedGumballId: (id: number) => void;
  // Date & Time
  setStartDate: (date: Date | null) => void;
  setStartTimeHour: (hour: string) => void;
  setStartTimeMinute: (minute: string) => void;
  setStartTimePeriod: (period: "AM" | "PM") => void;
  setEndDate: (date: Date | null) => void;
  setEndTimeHour: (hour: string) => void;
  setEndTimeMinute: (minute: string) => void;
  setEndTimePeriod: (period: "AM" | "PM") => void;
  setSelectedDuration: (duration: DurationPreset) => void;
  applyDurationPreset: (preset: DurationPreset) => void;

  // Ticket Configuration
  setPrizeCount: (count: string) => void;
  setTicketPrice: (price: string) => void;
  setTicketPricePerSol: (price: string) => void;
  setIsTicketSol: (isSol: boolean) => void;
  setTicketCurrency: (currency: { symbol: string; address: string }) => void;

  // ======================= Actions - Load Prizes =======================
  addPrize: (prize: GumballPrize) => void;
  removePrize: (id: string) => void;
  updatePrize: (id: string, updates: Partial<GumballPrize>) => void;
  clearPrizes: () => void;
  setTotalPrizeValue: (value: number) => void;
  setMaxProceeds: (value: number) => void;
  setLoadedPrizes: (prizes: LoadedPrize[]) => void;
  clearLoadedPrizes: () => void;
  setTotalPrizesLoaded: (count: number) => void;
  updatePrizeStats: (prizesLoaded: number, prizeValueInSol: number) => void;
  // ======================= Actions - Buy Back Settings =======================
  setBuyBackEnabled: (enabled: boolean) => void;
  setBuyBackPercentage: (percentage: number) => void;
  setBuyBackEscrowBalance: (balance: number) => void;

  // ======================= Actions - Gumball Studio =======================
  setCurrentGumballId: (id: number | null) => void;
  setCurrentGumball: (gumball: GumballData | null) => void;

  // ======================= Actions - Advanced Settings =======================
  setHolderOnlyEnabled: (enabled: boolean) => void;
  setHolderOnlyCollection: (collection: string) => void;
  addCollection: (collection: string) => void;
  removeCollection: (index: number) => void;

  // ======================= Actions - Terms =======================
  setAgreedToTerms: (agreed: boolean) => void;

  // ======================= Actions - Utilities =======================
  reset: () => void;
  resetSetup: () => void;

  // ======================= Computed Getters =======================
  getStartTimestamp: () => number | null;
  getEndTimestamp: () => number | null;
  getComputedRent: () => number;
  getMaxROI: () => string;
  getPrizesByCategory: (category: PrizeCategory) => GumballPrize[];
  getNftPrizesCount: () => number;
  getTokenPrizesCount: () => number;
  getCreatedGumballId: () => number;
}

/* ----------------------------- Initial State ----------------------------- */

const initialSetupState = {
  name: "",
  startType: "manual" as StartType,
  startDate: null as Date | null,
  startTimeHour: "12",
  startTimeMinute: "00",
  startTimePeriod: "PM" as "AM" | "PM",
  selectedDuration: null as DurationPreset,
  endDate: null as Date | null,
  endTimeHour: "12",
  endTimeMinute: "00",
  endTimePeriod: "PM" as "AM" | "PM",
  prizeCount: "",
  ticketPrice: "",
  ticketPricePerSol: "0",
  isTicketSol: true,
  ticketCurrency: {
    symbol: "SOL",
    address: "So11111111111111111111111111111111111111112",
  },
  rent: 0,
};

const initialState = {
  // UI States
  activeTab: "setup" as GumballTab,
  studioTab: "sold" as StudioTab,
  isCreateTokenModalOpen: false,
  isAddNftModalOpen: false,
  isAddTokenModalOpen: false,
  isAdvancedSettingsOpen: false,
  isCreatingGumball: false,
  isLoadingPrizes: false,
  createdGumballId: 0,
  // Setup
  ...initialSetupState,

  // Load Prizes
  prizes: [] as GumballPrize[],
  loadedPrizes: [] as LoadedPrize[],
  totalPrizeValue: 0,
  maxProceeds: 0,
  totalPrizesLoaded: 0,
  // Buy Back Settings
  buyBackEnabled: false,
  buyBackPercentage: 80,
  buyBackEscrowBalance: 0,

  // Gumball Studio
  currentGumballId: null as number | null,
  currentGumball: null as GumballData | null,

  // Advanced Settings
  holderOnlyEnabled: false,
  holderOnlyCollection: "",
  additionalCollections: [] as string[],

  // Terms
  agreedToTerms: false,
};

/* ----------------------------- Store ----------------------------- */

export const useGumballStore = create<GumballState>((set, get) => ({
  ...initialState,

  // ======================= Actions - UI =======================
  setActiveTab: (tab) => set({ activeTab: tab }),
  setStudioTab: (tab) => set({ studioTab: tab }),
  openCreateTokenModal: () => set({ isCreateTokenModalOpen: true }),
  closeCreateTokenModal: () => set({ isCreateTokenModalOpen: false }),
  openAddNftModal: () => set({ isAddNftModalOpen: true }),
  closeAddNftModal: () => set({ isAddNftModalOpen: false }),
  openAddTokenModal: () => set({ isAddTokenModalOpen: true }),
  closeAddTokenModal: () => set({ isAddTokenModalOpen: false }),
  toggleAdvancedSettings: () =>
    set((state) => ({ isAdvancedSettingsOpen: !state.isAdvancedSettingsOpen })),
  setAdvancedSettingsOpen: (open) => set({ isAdvancedSettingsOpen: open }),
  setIsCreatingGumball: (isCreating) => set({ isCreatingGumball: isCreating }),
  setIsLoadingPrizes: (isLoading) => set({ isLoadingPrizes: isLoading }),

  // ======================= Actions - Gumball Setup =======================
  setName: (name) => set({ name }),
  setStartType: (type) => set({ startType: type }),
  setCreatedGumballId: (id) => set({ createdGumballId: id }),
  // Date & Time
  setStartDate: (date) => set({ startDate: date }),
  setStartTimeHour: (hour) => set({ startTimeHour: hour }),
  setStartTimeMinute: (minute) => set({ startTimeMinute: minute }),
  setStartTimePeriod: (period) => set({ startTimePeriod: period }),
  setEndDate: (date) => set({ endDate: date, selectedDuration: null }),
  setEndTimeHour: (hour) => set({ endTimeHour: hour }),
  setEndTimeMinute: (minute) => set({ endTimeMinute: minute }),
  setEndTimePeriod: (period) => set({ endTimePeriod: period }),
  setSelectedDuration: (duration) => set({ selectedDuration: duration }),

  applyDurationPreset: (preset) => {
    if (!preset) return;

    const now = new Date();
    const hoursToAdd =
      preset === "24hr"
        ? 24
        : preset === "36hr"
          ? 36
          : preset === "48hr"
            ? 48
            : preset === "72hr"
              ? 72
              : 0;

    const endDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
    const hours = endDate.getHours();
    const minutes = endDate.getMinutes();

    set({
      selectedDuration: preset,
      endDate: endDate,
      endTimeHour: String(hours > 12 ? hours - 12 : hours || 12).padStart(2, "0"),
      endTimeMinute: String(minutes).padStart(2, "0"),
      endTimePeriod: hours >= 12 ? "PM" : "AM",
    });
  },

  // Ticket Configuration
  setPrizeCount: async (count) => {
    set({ prizeCount: count });
    const rentPerPrize = await calculateRent(109); //109 is the byte size of the gumball
    set({ rent: (rentPerPrize?.rentSol || 0) });
  },
  setTicketPrice: (price) => set({ ticketPrice: price }),
  setTicketPricePerSol: (price) => set({ ticketPricePerSol: price }),
  setIsTicketSol: (isSol) => set({ isTicketSol: isSol }),
  setTicketCurrency: (currency) => set({ ticketCurrency: currency }),

  // ======================= Actions - Load Prizes =======================
  addPrize: (prize) =>
    set((state) => {
      const newPrizes = [...state.prizes, prize];
      const totalValue = newPrizes.reduce(
        (sum, p) => sum + (p.floorPrice || 0) * p.quantity,
        0
      );
      return {
        prizes: newPrizes,
        totalPrizeValue: totalValue,
      };
    }),

  removePrize: (id) =>
    set((state) => {
      const newPrizes = state.prizes.filter((p) => p.id !== id);
      const totalValue = newPrizes.reduce(
        (sum, p) => sum + (p.floorPrice || 0) * p.quantity,
        0
      );
      return {
        prizes: newPrizes,
        totalPrizeValue: totalValue,
      };
    }),

  updatePrize: (id, updates) =>
    set((state) => {
      const newPrizes = state.prizes.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      const totalValue = newPrizes.reduce(
        (sum, p) => sum + (p.floorPrice || 0) * p.quantity,
        0
      );
      return {
        prizes: newPrizes,
        totalPrizeValue: totalValue,
      };
    }),

  clearPrizes: () =>
    set({
      prizes: [],
      totalPrizeValue: 0,
    }),

  setTotalPrizeValue: (value) => set({ totalPrizeValue: value }),
  setMaxProceeds: (value) => set({ maxProceeds: value }),

  setLoadedPrizes: (prizes) => set({ loadedPrizes: prizes }),
  clearLoadedPrizes: () => set({ loadedPrizes: [] }),
  setTotalPrizesLoaded: (count) => set({ totalPrizesLoaded: count }),

  updatePrizeStats: (prizesLoaded, prizeValueInSol) =>
    set((state) => {
      const newTotalLoaded = state.totalPrizesLoaded + prizesLoaded;
      const newTotalPrizeValue = state.totalPrizeValue + prizeValueInSol;
      const ticketPriceNum = parseFloat(state.ticketPrice) || 0;
      const prizeCountNum = parseInt(state.prizeCount) || 0;
      const newMaxProceeds = prizeCountNum * (ticketPriceNum/10**(VerifiedTokens.find((token) => token.address === state.ticketCurrency.address)?.decimals || 0));
      return {
        totalPrizesLoaded: newTotalLoaded,
        totalPrizeValue: newTotalPrizeValue,
        maxProceeds: newMaxProceeds,
      };
    }),
  // ======================= Actions - Buy Back Settings =======================
  setBuyBackEnabled: (enabled) => set({ buyBackEnabled: enabled }),
  setBuyBackPercentage: (percentage) => set({ buyBackPercentage: percentage }),
  setBuyBackEscrowBalance: (balance) => set({ buyBackEscrowBalance: balance }),

  // ======================= Actions - Gumball Studio =======================
  setCurrentGumballId: (id) => set({ currentGumballId: id }),
  setCurrentGumball: (gumball) => set({ currentGumball: gumball }),

  // ======================= Actions - Advanced Settings =======================
  setHolderOnlyEnabled: (enabled) => set({ holderOnlyEnabled: enabled }),
  setHolderOnlyCollection: (collection) =>
    set({ holderOnlyCollection: collection }),
  addCollection: (collection) =>
    set((state) => ({
      additionalCollections: [...state.additionalCollections, collection],
    })),
  removeCollection: (index) =>
    set((state) => ({
      additionalCollections: state.additionalCollections.filter(
        (_, i) => i !== index
      ),
    })),

  // ======================= Actions - Terms =======================
  setAgreedToTerms: (agreed) => set({ agreedToTerms: agreed }),

  // ======================= Actions - Utilities =======================
  reset: () => set(initialState),
  resetSetup: () => set(initialSetupState),

  // ======================= Computed Getters =======================
  getStartTimestamp: () => {
    const { startType, startDate, startTimeHour, startTimeMinute, startTimePeriod } =
      get();

    if (startType === "manual") {
      return Math.floor(Date.now() / 1000);
    }

    if (!startDate) return null;

    const date = new Date(startDate);
    let hours = parseInt(startTimeHour) || 12;

    if (startTimePeriod === "PM" && hours !== 12) {
      hours += 12;
    } else if (startTimePeriod === "AM" && hours === 12) {
      hours = 0;
    }

    date.setHours(hours, parseInt(startTimeMinute) || 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
  },

  getEndTimestamp: () => {
    const { endDate, endTimeHour, endTimeMinute, endTimePeriod } = get();
    if (!endDate) return null;

    const date = new Date(endDate);
    let hours = parseInt(endTimeHour) || 12;

    if (endTimePeriod === "PM" && hours !== 12) {
      hours += 12;
    } else if (endTimePeriod === "AM" && hours === 12) {
      hours = 0;
    }

    date.setHours(hours, parseInt(endTimeMinute) || 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
  },

  getComputedRent: () => {
    const { prizeCount } = get();
    const count = parseInt(prizeCount) || 0;
    const rentPerPrize = 0.00072;
    return Math.min(Math.round(count * rentPerPrize * 1000) / 1000, 0.72);
  },

  getMaxROI: () => {
    const { totalPrizeValue, prizeCount, ticketPrice, ticketCurrency } = get();
    const count = parseInt(prizeCount) || 0;
    const price = parseFloat(ticketPrice)/(10**(VerifiedTokens.find((token) => token.address === ticketCurrency.address)?.decimals || 0)) || 0;

    if (totalPrizeValue === 0 || count === 0 || price === 0) {
      return "-";
    }

    const maxProceeds = count * price;
    const roi = ((maxProceeds - totalPrizeValue) / totalPrizeValue) * 100;
    return `${roi.toFixed(2)}%`;
  },

  getPrizesByCategory: (category) => {
    return get().prizes.filter((p) => p.category === category);
  },

  getNftPrizesCount: () => {
    return get().prizes.filter((p) => p.category === "nft").length;
  },

  getTokenPrizesCount: () => {
    return get().prizes.filter((p) => p.category === "token").length;
  },
  getCreatedGumballId: () => {
    return get().createdGumballId;
  },
}));

/* ----------------------------- Selectors (for performance optimization) ----------------------------- */

export const selectActiveTab = (state: GumballState) => state.activeTab;
export const selectPrizes = (state: GumballState) => state.prizes;
export const selectLoadedPrizes = (state: GumballState) => state.loadedPrizes;
export const selectIsCreatingGumball = (state: GumballState) => state.isCreatingGumball;
export const selectCurrentGumball = (state: GumballState) => state.currentGumball;
export const selectBuyBackEnabled = (state: GumballState) => state.buyBackEnabled;
export const selectSetupData = (state: GumballState) => ({
  name: state.name,
  startType: state.startType,
  selectedDuration: state.selectedDuration,
  prizeCount: state.prizeCount,
  ticketPrice: state.ticketPrice,
  isTicketSol: state.isTicketSol,
  ticketCurrency: state.ticketCurrency,
  rent: state.rent,
  agreedToTerms: state.agreedToTerms,
});

