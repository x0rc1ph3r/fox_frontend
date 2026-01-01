import { calculateRent } from "hooks/helpers";
import { create } from "zustand";

/* ----------------------------- Types ----------------------------- */

export type PrizeType = "nft" | "spl" | "sol";
export type DurationPreset = "24hr" | "36hr" | "48hr" | null;

interface CreateRaffleState {
  // UI States
  isVerifiedCollectionsModalOpen: boolean;
  isCreateTokenModalOpen: boolean;
  isAdvancedSettingsOpen: boolean;
  isCreatingRaffle: boolean;    
  // Date & Time
  endDate: Date | null;
  endTimeHour: string;
  endTimeMinute: string;
  endTimePeriod: "AM" | "PM";
  selectedDuration: DurationPreset;

  // Ticket Configuration
  supply: string;
  ticketPrice: string;
  ticketPricePerSol: string;
  ticketCurrency: {
    symbol: string;
    address: string;
  };

  // Prize Configuration
  prizeType: PrizeType;
  nftPrizeMint: string;
  nftPrizeName: string;
  tokenPrizeAmount: string;
  tokenPrizeMint: string;
  prizeImage: string;
  floor:string;
  val:string;
  ttv:number;
  percentage:string;
  rent:number;
  nftCollection:string | null;

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
  setIsCreatingRaffle: (isCreating: boolean) => void;
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
  setTicketCurrency: (currency: { symbol: string; address: string }) => void;

  // Actions - Prize Configuration
  setPrizeType: (type: PrizeType) => void;
  setNftPrizeMint: (mint: string) => void;
  setNftPrizeName: (name: string) => void;
  setTokenPrizeAmount: (amount: string) => void;
  setTokenPrizeMint: (mint: string) => void;
  setTicketPricePerSol: (price: string) => void;
  setPrizeImage: (image: string) => void;
  setFloor: (floor:string) => void;
  setNftCollection: (collection: string | null) => void;
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
  getComputedRent: () => Promise<number>;
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
  isCreatingRaffle: false,

  // Date & Time
  endDate: null as Date | null,
  endTimeHour: "12",
  endTimeMinute: "00",
  endTimePeriod: "PM" as "AM" | "PM",
  selectedDuration: null as DurationPreset,

  // Ticket Configuration
  supply: "",
  ticketPrice: "",
  ticketPricePerSol: "0",
  ticketCurrency: {
    symbol: "SOL",
    address: "So11111111111111111111111111111111111111112",
  },

  // Prize Configuration
  prizeType: "nft" as PrizeType,
  nftPrizeMint: "",
  nftPrizeName: "",
  tokenPrizeAmount: "",
  tokenPrizeMint: "So11111111111111111111111111111111111111112",
  prizeImage:"",
  floor:"0" ,
  val:"0",
  ttv:0,
  percentage:"0",
  nftCollection:null as string | null,
  rent:0,
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
  setIsCreatingRaffle: (isCreating: boolean) => set({ isCreatingRaffle: isCreating }),
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
  setSupply: (supply) => set({ supply,ticketLimitPerWallet: "40" }),
  setTicketPrice: (price) => set({ ticketPrice: price }),
  setTicketCurrency: (currency: { symbol: string; address: string }) => set({ ticketCurrency: currency }),
  setTicketPricePerSol: (price: string) => set({ ticketPricePerSol: price }),
  // Actions - Prize Configuration
  setPrizeType: (type) => set({ prizeType: type }),
  setNftPrizeMint: (mint) => set({ nftPrizeMint: mint }),
  setNftPrizeName: (name) => set({ nftPrizeName: name }),
  setTokenPrizeAmount: (amount) => set({ tokenPrizeAmount: amount }),
  setTokenPrizeMint: (mint) => set({ tokenPrizeMint: mint }),
  setPrizeImage: (image:string) => set({ prizeImage: image }),
  setFloor: (floor:string) => {
    set({ floor: floor })
    if(get().prizeType === "nft"){
      if(get().ttv>0){
        set({ percentage: (((get().ttv-(parseFloat(get().floor)/10**9)) / get().ttv) * 100).toFixed(2)});
      }
    }
  },
  setVal: (val:string) => {
    set({ val: val });
    if(parseFloat(val)>0 && get().ttv>0){
      set({ percentage: ((get().ttv-parseFloat(val) / get().ttv) * 100).toFixed(2)});
    }
  },
  setTtv: (ttv:number) => {
    set({ ttv: ttv });
    if(get().prizeType !== "nft" && parseFloat(get().val)>0 && get().ttv>0){
      set({ percentage: ((get().ttv-parseFloat(get().val) / get().ttv) * 100).toFixed(2)});
    }else if(get().prizeType === "nft"){
      set({ percentage: (((get().ttv-(parseFloat(get().floor)/10**9)) / get().ttv) * 100).toFixed(2)});
    }
  },
  setPercentage: (percentage:string) => {
    set({ percentage: percentage });
  },
  setNftCollection: (collection: string | null) => set({ nftCollection: collection }),
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
    // const remainder = 100 - shares.reduce((a, b) => a + b, 0);
    // for (let i = 0; i < remainder; i++) {
    //   shares[i]++;
    // }
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
  getComputedRent: async () => {
    const winner = parseInt(get().numberOfWinners) || 1;
    console.log("winner",winner)
    const rent = await calculateRent(winner);
    console.log("rent",rent)
    set({ rent: rent?.rentSol || 0 });
    return Math.round(rent?.rentSol || 0 * 1000) / 1000;
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
    const ticketPrice = parseFloat(get().ticketPricePerSol) || 0;
    set({ ttv: Math.round(supply * ticketPrice * 1000) / 1000 });
    if(parseFloat(get().val)>0 && get().ttv>0){
      set({ percentage: ((get().ttv-parseFloat(get().val) / get().ttv) * 100).toFixed(2)});
    }else if(get().prizeType === "nft"){
      set({ percentage: (((get().ttv-(parseFloat(get().floor)/10**9)) / get().ttv) * 100).toFixed(2)});
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

