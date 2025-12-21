import { useGetTokenPrice } from "hooks/useGetTokenPrice";
import { create } from "zustand";

/* ----------------------------- Types ----------------------------- */

export type PrizeType = "nft" | "spl" | "sol";
export type DurationPreset = "24hr" | "36hr" | "48hr" | null;

interface CreateRaffleState {
  // UI States
  isVerifiedCollectionsModalOpen: boolean;
  isCreateTokenModalOpen: boolean;
  isAdvancedSettingsOpen: boolean;

  // Date & Time
  endDate: Date | null;
  endTimeHour: string;
  endTimeMinute: string;
  endTimePeriod: "AM" | "PM";
  selectedDuration: DurationPreset;

  // Ticket Configuration
  supply: string;
  ticketPrice: string;
  ticketCurrency: string;

  // Prize Configuration
  prizeType: PrizeType;
  nftPrizeMint: string;
  tokenPrizeAmount: string;
  tokenPrizeMint: string;
  val:string;
  ttv:number;
  percentage:string;

  // Advanced Settings
  holderOnlyCollection: string;
  additionalCollections: string[];
  ticketLimitPerWallet: string;
  numberOfWinners: string;
  winShares: number[];
  isUniqueWinners: boolean;

  // Terms
  agreedToTerms: boolean;

  // Search (for modals)
  collectionSearchQuery: string;

  // User Verified Tokens
  userVerifiedTokens: string[];

  // Actions - UI
  openVerifiedCollectionsModal: () => void;
  closeVerifiedCollectionsModal: () => void;
  openCreateTokenModal: () => void;
  closeCreateTokenModal: () => void;
  toggleAdvancedSettings: () => void;
  setAdvancedSettingsOpen: (open: boolean) => void;

  // Actions - Date & Time
  setEndDate: (date: Date | null) => void;
  setEndTimeHour: (hour: string) => void;
  setEndTimeMinute: (minute: string) => void;
  setEndTimePeriod: (period: "AM" | "PM") => void;
  setSelectedDuration: (duration: DurationPreset) => void;
  applyDurationPreset: (preset: DurationPreset) => void;

  // Actions - Ticket Configuration
  setSupply: (supply: string) => void;
  setTicketPrice: (price: string) => void;
  setTicketCurrency: (currency: string) => void;

  // Actions - Prize Configuration
  setPrizeType: (type: PrizeType) => void;
  setNftPrizeMint: (mint: string) => void;
  setTokenPrizeAmount: (amount: string) => void;
  setTokenPrizeMint: (mint: string) => void;

  // Actions - Advanced Settings
  setHolderOnlyCollection: (collection: string) => void;
  addCollection: (collection: string) => void;
  removeCollection: (index: number) => void;
  setTicketLimitPerWallet: (limit: string) => void;
  setNumberOfWinners: (winners: string) => void;
  setWinShares: (shares: number[]) => void;
  setIsUniqueWinners: (unique: boolean) => void;
  setUserVerifiedTokens: (tokens: string[]) => void;
  // Actions - Terms
  setAgreedToTerms: (agreed: boolean) => void;

  // Actions - Search
  setCollectionSearchQuery: (query: string) => void;

  // Actions - Utilities
  reset: () => void;

  // Computed values (as getters via selectors)
  getComputedRent: () => number;
  getComputedTTV: () => number;
  getEndTimestamp: () => number | null;
  getComputedVal: (tokenPrice:number, SolPrice:number) => number;
}

/* ----------------------------- Initial State ----------------------------- */

const initialState = {
  // UI States
  isVerifiedCollectionsModalOpen: false,
  isCreateTokenModalOpen: false,
  isAdvancedSettingsOpen: true,

  // Date & Time
  endDate: null as Date | null,
  endTimeHour: "12",
  endTimeMinute: "00",
  endTimePeriod: "PM" as "AM" | "PM",
  selectedDuration: null as DurationPreset,

  // Ticket Configuration
  supply: "",
  ticketPrice: "",
  ticketCurrency: "SOL",

  // Prize Configuration
  prizeType: "nft" as PrizeType,
  nftPrizeMint: "",
  tokenPrizeAmount: "",
  tokenPrizeMint: "So11111111111111111111111111111111111111112",
  val:"0",
  ttv:0,
  percentage:"0",
  // Advanced Settings
  holderOnlyCollection: "",
  additionalCollections: [] as string[],
  ticketLimitPerWallet: "",
  numberOfWinners: "1",
  winShares: [100] as number[],
  isUniqueWinners: true,

  // Terms
  agreedToTerms: false,

  // Search
  collectionSearchQuery: "",
  userVerifiedTokens: [],
};

/* ----------------------------- Store ----------------------------- */

export const useCreateRaffleStore = create<CreateRaffleState>((set, get) => ({
  ...initialState,

  // Actions - UI
  openVerifiedCollectionsModal: () =>
    set({ isVerifiedCollectionsModalOpen: true }),
  closeVerifiedCollectionsModal: () =>
    set({ isVerifiedCollectionsModalOpen: false }),
  openCreateTokenModal: () => set({ isCreateTokenModalOpen: true }),
  closeCreateTokenModal: () => set({ isCreateTokenModalOpen: false }),
  toggleAdvancedSettings: () =>
    set((state) => ({ isAdvancedSettingsOpen: !state.isAdvancedSettingsOpen })),
  setAdvancedSettingsOpen: (open) => set({ isAdvancedSettingsOpen: open }),

  // Actions - Date & Time
  setEndDate: (date) => set({ endDate: date, selectedDuration: null }),
  setEndTimeHour: (hour) => set({ endTimeHour: hour }),
  setEndTimeMinute: (minute) => set({ endTimeMinute: minute }),
  setEndTimePeriod: (period) => set({ endTimePeriod: period }),
  setSelectedDuration: (duration) => set({ selectedDuration: duration }),

  applyDurationPreset: (preset) => {
    if (!preset) return;

    const now = new Date();
    const hoursToAdd =
      preset === "24hr" ? 24 : preset === "36hr" ? 36 : preset === "48hr" ? 48 : 0;

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

  // Actions - Ticket Configuration
  setSupply: (supply) => set({ supply }),
  setTicketPrice: (price) => set({ ticketPrice: price }),
  setTicketCurrency: (currency) => set({ ticketCurrency: currency }),

  // Actions - Prize Configuration
  setPrizeType: (type) => set({ prizeType: type }),
  setNftPrizeMint: (mint) => set({ nftPrizeMint: mint }),
  setTokenPrizeAmount: (amount) => set({ tokenPrizeAmount: amount }),
  setTokenPrizeMint: (mint) => set({ tokenPrizeMint: mint }),
  setVal: (val:string) => set({ val: val }),
  setTtv: (ttv:number) => set({ ttv: ttv }),
  setPercentage: (percentage:string) => set({ percentage: percentage }),
  // Actions - Advanced Settings
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
  setTicketLimitPerWallet: (limit) => set({ ticketLimitPerWallet: limit }),
  setNumberOfWinners: (winners) => {
    const numWinners = parseInt(winners) || 1;
    // Default to equal shares
    const shares = Array(numWinners).fill(Math.floor(100 / numWinners));
    // Distribute remainder to first winners
    const remainder = 100 - shares.reduce((a, b) => a + b, 0);
    for (let i = 0; i < remainder; i++) {
      shares[i]++;
    }
    set({ numberOfWinners: winners, winShares: shares });
  },
  setWinShares: (shares) => set({ winShares: shares }),
  setIsUniqueWinners: (unique) => set({ isUniqueWinners: unique }),

  // Actions - User Verified Tokens
  setUserVerifiedTokens: (tokens) => set({ userVerifiedTokens: tokens }),

  // Actions - Terms
  setAgreedToTerms: (agreed) => set({ agreedToTerms: agreed }),

  // Actions - Search
  setCollectionSearchQuery: (query) => set({ collectionSearchQuery: query }),

  // Actions - Utilities
  reset: () => set(initialState),

  // Computed values
  getComputedRent: () => {
    const supply = parseInt(get().supply) || 0;
    // Example rent calculation: 0.00072 SOL per ticket, max 0.72 SOL
    const rent = Math.min(supply * 0.00072, 0.72);
    return Math.round(rent * 1000) / 1000;
  },
  getComputedVal:(tokenPrice:number, SolPrice:number)=>{
    set({ val: (Math.round((parseFloat(get().tokenPrizeAmount) * tokenPrice) / SolPrice * 1000) / 1000).toFixed(2) });
    if(parseFloat(get().val)>0 && get().ttv>0){
      set({ percentage: ((get().ttv-parseFloat(get().val) / get().ttv) * 100).toFixed(2)});
    }
    return Math.round((parseFloat(get().tokenPrizeAmount) * tokenPrice) / SolPrice * 1000) / 1000;
  },
  getComputedTTV: () => {
    const supply = parseInt(get().supply) || 0;
    const ticketPrice = parseFloat(get().ticketPrice) || 0;
    set({ ttv: Math.round(supply * ticketPrice * 1000) / 1000 });
    if(parseFloat(get().val)>0 && get().ttv>0){
      set({ percentage: ((get().ttv-parseFloat(get().val) / get().ttv) * 100).toFixed(2)});
    }
    return Math.round(supply * ticketPrice * 1000) / 1000;
  },

  getEndTimestamp: () => {
    const { endDate, endTimeHour, endTimeMinute, endTimePeriod } = get();
    if (!endDate) return null;

    const date = new Date(endDate);
    let hours = parseInt(endTimeHour) || 12;

    // Convert to 24h format
    if (endTimePeriod === "PM" && hours !== 12) {
      hours += 12;
    } else if (endTimePeriod === "AM" && hours === 12) {
      hours = 0;
    }

    date.setHours(hours, parseInt(endTimeMinute) || 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
  },
}));

