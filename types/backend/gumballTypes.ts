import z from "zod";

export const createGumballSchema = z.object({
  creatorAddress: z.string().min(1),
  id: z.number().int().gt(0),
  name: z.string().min(1).max(32),
  manualStart: z.boolean().default(false),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  totalTickets: z.number().int().gt(0),
  ticketMint: z.string().optional(),
  ticketPrice: z.string().min(1),
  isTicketSol: z.boolean().default(true),
  maxPrizes: z.number().int().gt(2).default(1000),
});


export type GumballBackendType = z.infer<typeof createGumballSchema>;

export const addPrizeSchema = z.object({
    prizeIndex: z.number().int().gte(0),
    isNft: z.boolean().default(false),
    mint: z.string().min(1),
    name: z.string().optional(),
    symbol: z.string().optional(),
    image: z.string().optional(),
    decimals: z.number().int().optional(),
    totalAmount: z.string().min(1),
    prizeAmount: z.string().min(1),
    quantity: z.number().int().gt(0),
    floorPrice: z.string().optional(),
    txSignature: z.string().min(1),
});

export type AddPrizeTypeBackend = z.infer<typeof addPrizeSchema>;

const prizeDataSchema = z.object({
  prizeIndex: z.number().int().gte(0),
  isNft: z.boolean().default(false),
  mint: z.string().min(1),
  name: z.string().optional(),
  symbol: z.string().optional(),
  image: z.string().optional(),
  decimals: z.number().int().optional(),
  totalAmount: z.string().min(1),
  prizeAmount: z.string().min(1),
  quantity: z.number().int().gt(0),
  floorPrice: z.string().optional(),
});

export type PrizeDataBackend = z.infer<typeof prizeDataSchema>;

export const addPrizesSchema = z.object({
  prizes: z.array(prizeDataSchema).min(1),
  txSignature: z.string().min(1),
});

export type AddMultiplePrizesTypeBackend = z.infer<typeof addPrizesSchema>;

const spinDataSchema = z.object({
  id: z.number().int(),
  gumballId: z.number().int(),
  prizeId: z.number().int(),
  spinnerAddress: z.string().min(1),
  winnerAddress: z.string().min(1),
  prizeAmount: z.string().min(1),
  spunAt: z.string().datetime(),
  claimed: z.boolean(),
  claimedAt: z.string().datetime().nullable(),
  spinner: z.object({
    walletAddress: z.string().min(1),
    twitterId: z.string().nullable(),
  }),
  transaction: z.object({
    transactionId: z.string().min(1),
    type: z.enum(["GUMBALL_SPIN"]),
    sender: z.string().min(1),
    receiver: z.string().min(1),
    amount: z.string().min(1),
    mintAddress: z.string().min(1),
    isNft: z.boolean(),
    metadata: z.object({
      prizeId: z.number().int(),
      prizeMint: z.string().min(1),
      prizeAmount: z.string().min(1),
      prizeName: z.string().min(1),
      prizeImage: z.string().min(1),
      prizeIndex: z.number().int(),
    }),
  }),
});

export const gumballBackendDataSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  creatorAddress: z.string(),
  status: z.enum(["INITIALIZED", "ACTIVE", "COMPLETED_SUCCESSFULLY", "COMPLETED_FAILED", "CANCELLED"]),
  
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  activatedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  manualStart: z.boolean(),
  
  ticketMint: z.string(),
  ticketPrice: z.string(),
  isTicketSol: z.boolean(),
  totalTickets: z.number().int(),
  ticketsSold: z.number().int(),
  
  minPrizes: z.number().int(),
  maxPrizes: z.number().int(),
  prizesAdded: z.number().int(),
  prizes: z.array(prizeDataSchema),
  totalPrizeValue: z.string(),
  
  maxProceeds: z.string(),
  totalProceeds: z.string(),
  maxRoi: z.number(),
  
  buyBackEnabled: z.boolean(),
  buyBackCount: z.number().int(),
  buyBackEscrow: z.string().nullable(),
  buyBackPercentage: z.number().nullable(),
  buyBackProfit: z.string(),
  
  // Stats
  uniqueBuyers: z.number().int(),
  _count: z.object({
    spins: z.number().int(),
  }),
  spins: z.array(spinDataSchema),
});

export type GumballBackendDataType = z.infer<typeof gumballBackendDataSchema>;
export type SpinDataBackend = z.infer<typeof spinDataSchema>;