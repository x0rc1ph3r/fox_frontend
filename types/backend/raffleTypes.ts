import { z } from "zod";

const prizeDataSchema = z.object({
    type: z.enum(["TOKEN", "NFT"]).default("TOKEN"),
    address: z.string().min(1),
    mintAddress: z.string().min(1),
    mint: z.string().min(1),
    name: z.string().min(1),
    verified: z.boolean().optional().default(true),
    symbol: z.string().min(1),
    decimals: z.number().int().optional(),
    image: z.string().min(1),
    attributes: z.any().optional(),
    collection: z.string().optional(),
    creator: z.string().optional(),
    description: z.string().optional(),
    externalUrl: z.string().optional(),
    properties: z.any().optional(),
    amount: z.number().gt(0).optional(),
    floor: z.number().gt(0).optional(),
});
enum TransactionType {
    RAFFLE_CREATION,
    RAFFLE_ENTRY,
    RAFFLE_WIN,
    RAFFLE_CANCEL,
    RAFFLE_END,
    RAFFLE_CLAIM,
    RAFFLE_REFUND,
    RAFFLE_PURCHASE,
    RAFFLE_DEPOSIT,
  }

  const transactionSchema = z.object({
    id: z.string().min(1),
    transactionId: z.string().min(1),
    type: z.enum(Object.values(TransactionType) as [string, ...string[]]),
    sender: z.string().min(1),
    receiver: z.string().min(1),
    createdAt: z.coerce.date(),
    amount: z.number().gt(0),
    isNft: z.boolean(),
    mintAddress: z.string().min(1),
    metadata: z.object({
        quantity: z.number().gt(0),
    }).optional(),
});

export const creatorSchema = z.object({
    walletAddress: z.string().min(1),
    twitterId: z.string().nullable().optional(),
    profileImage: z.string().nullable().optional(),
});

const raffleSchema = z.object({
    id: z.number().gt(0).optional(),
    state: z.enum(["Active", "Ended", "Cancelled", "SuccessEnded", "FailedEnded"]).optional(),
    ticketSold: z.number().gt(0).optional(),
    raffle: z.string().min(1).optional(),
    createdAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().min(new Date()),
    createdBy: z.string().min(1),
    ticketPrice: z.number().gt(0),
    ticketSupply: z.number().gt(0),
    ticketTokenAddress: z.string().min(1).optional(),
    ticketTokenSymbol: z.string().min(1).optional(),
    floor: z.number().gt(0).optional(),
    val: z.number().gt(0).optional(),
    ttv: z.number().gt(0),
    roi: z.number().gt(0),
    entriesAddress: z.string().min(1).optional(),
    prize: z.string().min(1).optional(),
    maxEntries: z.number().gt(0),
    numberOfWinners: z.number().gt(0),
    maxTickets: z.number().gt(0).optional(),
    prizeData: prizeDataSchema,
    ticketAmountClaimedByCreator: z.boolean().optional().default(false),
    raffleEntries: z.array(z.object({
        id: z.number().gt(0),
        userAddress: z.string().min(1),
        raffleId: z.number().gt(0),
        quantity: z.number().gt(0),
        user:z.object({
            walletAddress: z.string().min(1),
            twitterId: z.string().nullable().optional(),
            profileImage: z.string().nullable().optional(),
        }),
        transactions: z.array(transactionSchema),
    })).optional(),
    winners: z.array(z.object({
        walletAddress: z.string().min(1),
        twitterId: z.string().nullable().optional(),
        profileImage: z.string().nullable().optional(),
    })).optional(), 
    favouritedBy: z.array(z.object({
        walletAddress: z.string().min(1),
        twitterId: z.string().nullable().optional(),
        profileImage: z.string().nullable().optional(),
    })).optional(),
    txSignature: z.string().min(1),
    creator: creatorSchema.optional(),
});

export type RaffleTypeBackend = z.infer<typeof raffleSchema>;
export type TransactionTypeBackend = z.infer<typeof transactionSchema>;