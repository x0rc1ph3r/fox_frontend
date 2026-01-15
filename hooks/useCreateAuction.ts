import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuctionAnchorProgram } from "./useAuctionAnchorProgram";
import { PublicKey, Transaction } from "@solana/web3.js";
// import type { AuctionTypeBackend } from "../types/backend/auctionTypes";
import { useWallet } from "@solana/wallet-adapter-react";
import { VerifiedTokens, WRAPPED_SOL_MINT } from "../src/utils/verifiedTokens";
import {
    createAuctionOverBackend,
    getCreateAuctionTx,
} from "../api/routes/auctionRoutes";
import { useRouter } from "@tanstack/react-router";
import { useCheckAuth } from "./useCheckAuth";
import { connection } from "./helpers";


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

const FAKE_MINT = new PublicKey(WRAPPED_SOL_MINT);

export const useCreateAuction = () => {
    const { getAuctionConfig } = useAuctionAnchorProgram();
    const { data: auctionConfig, isLoading: isLoadingAuctionConfig, isError: isErrorAuctionConfig } = getAuctionConfig;
    const router = useRouter();
    const { publicKey, sendTransaction } = useWallet();
    const queryClient = useQueryClient();
    const { checkAndInvalidateToken } = useCheckAuth();
    const MIN_TIME = auctionConfig?.minimumAuctionPeriod

    const validateForm = async (args: AuctionOnChainArgs) => {
        try {
            if (MIN_TIME === undefined || isLoadingAuctionConfig || isErrorAuctionConfig) {
                throw new Error("Auction config not loaded");
            }
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }
            const isValid = await checkAndInvalidateToken(publicKey.toBase58());
            if (!isValid) {
                throw new Error("Signature verification failed");
            }
            if (!args.startTime) {
                throw new Error("Start Time is required");
            }
            if (!args.endTime) {
                throw new Error("End Time is required");
            }
            if (args.endTime <= args.startTime) {
                throw new Error("End time must be after start time");
            }
            if (!args.baseBid) {
                throw new Error("Base bid is required");
            }
            if (!args.minIncrement) {
                throw new Error("Min increment is required");
            }
            if (!args.timeExtension && args.timeExtension !== 0) {
                throw new Error("time extension is required");
            }
            if (!args.prizeMint) {
                throw new Error("No NFT selected");
            }
            if (!args.startImmediately && (args.endTime + 100) - args.startTime < MIN_TIME) {
                console.log((args.endTime + 100) - args.startTime, MIN_TIME)
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

    // const deleteAuctionOverBackend = async (auctionId: number) => {
    //     try {
    //         const response = await deleteAuction(auctionId.toString());
    //         if (response.error) {
    //             throw new Error("Failed to delete auction");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // }

    const fetchAuctionConfig = () => {
        const auctionConfig = getAuctionConfig.data;
        console.log(auctionConfig?.auctionCount)
        return auctionConfig?.auctionCount || 0;
    }

    const createAuction = useMutation({
        mutationKey: ["createAuction"],
        mutationFn: async (args: AuctionOnChainArgs) => {
            if (!(await validateForm(args))) {
                throw new Error("Validation failed");
            }

            const decimals = VerifiedTokens.find(
                (token) => token.symbol === args.currency
            )?.decimals;
            if (decimals === undefined) {
                throw new Error("Unsupported currency");
            }

            const { base64Transaction, minContextSlot, blockhash, lastValidBlockHeight } = await getCreateAuctionTx(args.startTime, args.endTime + 100, args.startImmediately, args.isBidMintSol, args.baseBid * Math.pow(10, decimals), args.minIncrement, args.timeExtension, args.prizeMint, args.bidMint || FAKE_MINT.toString());
            console.log("Received transaction from backend", base64Transaction);
            const decodedTx = Buffer.from(base64Transaction, "base64");
            const transaction = Transaction.from(decodedTx);

            //Send Transaction
            const signature = await sendTransaction(transaction, connection, {
                minContextSlot,
            });

            const confirmation = await connection.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature,
            });

            // const tx = await createAuctionMutation.mutateAsync({
            //     startTime: args.startTime,
            //     endTime: args.endTime + 100,
            //     startImmediately: args.startImmediately,
            //     isBidMintSol: args.isBidMintSol,
            //     baseBid: args.baseBid * Math.pow(10, decimals!),
            //     minIncrement: args.minIncrement,
            //     timeExtension: args.timeExtension,
            //     prizeMint: new PublicKey(args.prizeMint),
            //     bidMint: new PublicKey(args.bidMint!) // ignored if SOL
            // });
            if (confirmation.value.err) {
                console.log("Failed to create auction", confirmation.value.err);
                throw new Error("Failed to create auction");
            }
            const response = await createAuctionOverBackend({
                id: fetchAuctionConfig(),
                createdBy: publicKey?.toString() || "",
                prizeMint: args.prizeMint,
                collectionVerified: true,
                floorPrice: args.floorPrice,
                startsAt: args.startImmediately ? new Date() : new Date((args.startTime + 60) * 1000),
                endsAt: new Date((args.endTime + 100) * 1000),
                timeExtension: args.timeExtension,
                reservePrice: (args.baseBid * Math.pow(10, decimals)).toString(),
                currency: args.isBidMintSol ? "SOL" : args.currency,
                bidIncrementPercent: args.minIncrement,
                payRoyalties: false,
                royaltyPercentage: 0,
                bidEscrow: args.bidMint || FAKE_MINT.toString(),
                prizeName: args.prizeName,
                prizeImage: args.prizeImage,
                collectionName: args.collectionName,
                hasAnyBid: false,
                highestBidAmount: 0,
                highestBidderWallet: "",
                status: "INITIALIZED",
                txSignature: signature,
            });
            if (response.error) {
                throw new Error(response.error);
            }
            return response.auction.id;
        },
        // onMutate: async () => {
        //     return { auctionId: fetchAuctionConfig() };
        // },
        onSuccess: (auctionId: number) => {
            queryClient.invalidateQueries({ queryKey: ["auctions", auctionId.toString()] });
            toast.success("Auction created successfully");
            router.navigate({ to: "/auctions/$id", params: { id: auctionId.toString() } });
        },
        onError: async (error) => {
            console.error(error);
            toast.error("Failed to create auction");
        },
    });

    return { createAuction };
}
