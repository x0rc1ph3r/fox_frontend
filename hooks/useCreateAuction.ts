import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuctionAnchorProgram } from "./useAuctionAnchorProgram";
import { PublicKey } from "@solana/web3.js";
// import type { AuctionTypeBackend } from "../types/backend/auctionTypes";
import { useWallet } from "@solana/wallet-adapter-react";
import { VerifiedTokens } from "../src/utils/verifiedTokens";
import {
    createAuctionOverBackend,
    deleteAuction,
    verifyAuctionCreation,
} from "../api/routes/auctionRoutes";
import { useRouter } from "@tanstack/react-router";


export type AuctionOnChainArgs = {
    startImmediately: boolean;
    isBidMintSol: boolean;
    startTime: number;
    endTime: number;
    baseBid: number;
    minIncrement: number;
    timeExtension: number;
    prizeMint: string;
    bidMint?: string;
    prizeName: string;
    prizeImage: string;
    collectionName: string;
    floorPrice: number;
    currency: string;
};

const FAKE_MINT = new PublicKey('So11111111111111111111111111111111111111112');
const MIN_TIME = (24 * 60 * 60) + 100; // 24 hours in seconds

export const useCreateAuction = () => {
    const { createAuctionMutation, getAuctionConfig } = useAuctionAnchorProgram();
    const router = useRouter();
    const { publicKey } = useWallet();
    const queryClient = useQueryClient();

    const validateForm = (args: AuctionOnChainArgs) => {
        try {
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }
            if (!args.startTime) {
                throw new Error("Start Time is required");
            }
            if (!args.endTime) {
                throw new Error("End Time is required");
            }
            if (!args.baseBid) {
                throw new Error("Base bid is required");
            }
            if (!args.isBidMintSol) {
                throw new Error("Is Bid Mint SOL field is required");
            }
            if (!args.minIncrement) {
                throw new Error("Min increment is required");
            }
            if (!args.timeExtension && args.timeExtension !== 0) {
                throw new Error("time extension is required");
            }
            if (!args.prizeMint) {
                throw new Error("prize mint is required");
            }
            if (!args.bidMint) {
                args.bidMint = FAKE_MINT.toString()
            }
            if (args.endTime - args.startTime < MIN_TIME) {
                throw new Error("End time must be at least 24 hours after start time");
            }
            if (args.startImmediately === false && (args.startTime - 100) * 1000 < Date.now()) {
                throw new Error("Start time must be in the future");
            }

            return true;
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong");
            }
            return false;
        }

    };

    const deleteAuctionOverBackend = async (auctionId: number) => {
        try {
            const response = await deleteAuction(auctionId.toString());
            if (response.error) {
                throw new Error("Failed to delete auction");
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const fetchAuctionConfig = () => {
        const auctionConfig = getAuctionConfig.data;
        console.log(auctionConfig?.auctionCount)
        return auctionConfig?.auctionCount || 0;
    }

    const createAuction = useMutation({
        mutationKey: ["createAuction"],
        mutationFn: async (args: AuctionOnChainArgs) => {
            if (!validateForm(args)) {
                throw new Error("Validation failed");
            }

            const decimals = VerifiedTokens.find(
                (token) => token.symbol === args.currency
            )?.decimals;
            const data = await createAuctionOverBackend({
                id: fetchAuctionConfig(),
                createdBy: publicKey?.toString() || "",
                prizeMint: args.prizeMint,
                collectionVerified: true,
                floorPrice: args.floorPrice,
                startsAt: args.startImmediately ? new Date() : new Date(args.startTime * 1000),
                endsAt: new Date((args.endTime + 100) * 1000),
                timeExtension: args.timeExtension,
                reservePrice: (args.baseBid * Math.pow(10, decimals!)).toString(),
                currency: args.isBidMintSol ? "SOL" : args.currency,
                bidIncrementPercent: args.minIncrement,
                payRoyalties: false,
                royaltyPercentage: 0,
                bidEscrow: args.bidMint,
                prizeName: args.prizeName,
                prizeImage: args.prizeImage,
                collectionName: args.collectionName,
                hasAnyBid: false,
                highestBidAmount: 0,
                highestBidderWallet: "",
                status: "INITIALIZED",
            });
            const tx = await createAuctionMutation.mutateAsync({
                startTime: args.startTime,
                endTime: args.endTime + 100,
                startImmediately: args.startImmediately,
                isBidMintSol: args.isBidMintSol,
                baseBid: args.baseBid * Math.pow(10, decimals!),
                minIncrement: args.minIncrement,
                timeExtension: args.timeExtension,
                prizeMint: new PublicKey(args.prizeMint),
                bidMint: new PublicKey(args.bidMint!) // ignored if SOL
            });
            if (!tx || data.error) {
                throw new Error("Failed to create auction");
            } else {
                await new Promise((resolve) =>
                    setTimeout(() => {
                        resolve(true);
                    }, 2000)
                );
                const verifyData = await verifyAuctionCreation(data.auction.id, tx);
                if (verifyData.error) {
                    return data.auction.id;
                }
            }
            return data.auction.id;
        },
        onMutate: async () => {
            return { auctionId: fetchAuctionConfig() };
        },
        onSuccess: (auctionId: number) => {
            queryClient.invalidateQueries({ queryKey: ["auctions", auctionId.toString()] });
            toast.success("Auction created successfully");
            new Promise((resolve) => setTimeout(resolve, 2000));
            router.navigate({ to: "/auctions/$id", params: { id: auctionId.toString() } });
        },
        onError: async (_error, _args, context) => {
            if (context?.auctionId) {
                await deleteAuctionOverBackend(context.auctionId);
            }
            toast.error("Failed to create auction");
        },
    });

    return { createAuction };
}