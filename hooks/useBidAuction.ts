import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuctionAnchorProgram } from "./useAuctionAnchorProgram";
// import type { AuctionTypeBackend } from "../types/backend/auctionTypes";
import { useWallet } from "@solana/wallet-adapter-react";
// import { VerifiedTokens } from "../src/utils/verifiedTokens";
import {
    bidInAuction
} from "../api/routes/auctionRoutes";

interface BidAuctionArgs {
    auctionId: number;
    bidAmount: number;
}

export const useBidAuction = () => {
    const { placeBidMutation } = useAuctionAnchorProgram();
    const { publicKey } = useWallet();
    const queryClient = useQueryClient();

    const validateForm = (args: BidAuctionArgs) => {
        try {
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }
            if (!args.auctionId) {
                throw new Error("Auction ID is required");
            }
            if (args.bidAmount <= 0) {
                throw new Error("Bid amount must be greater than zero");
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

    const bidAuctionOverBackend = async (auctionId: number, txSignature: string, bidAmount: number) => {
        try {
            const response = await bidInAuction(auctionId.toString(), txSignature, bidAmount);
            if (response.error) {
                throw new Error("Failed to delete auction");
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const bidAuction = useMutation({
        mutationKey: ["bidAuction"],
        mutationFn: async (args: BidAuctionArgs) => {
            if (!validateForm(args)) {
                throw Error;
            }
            const tx = await placeBidMutation.mutateAsync({
                auctionId: args.auctionId,
                bidAmount: args.bidAmount,
            });
            await bidAuctionOverBackend(args.auctionId, tx, args.bidAmount);
            if (!tx) {
                throw new Error("Failed to create auction");
            } else {
                await new Promise((resolve) =>
                    setTimeout(() => {
                        resolve(true);
                    }, 2000)
                );
            }
            return args.auctionId;
        },
        onSuccess: (auctionId: number) => {
            toast.success("Bid placed successfully");
            queryClient.invalidateQueries({
                queryKey: ["auction", auctionId],
            });
        },
        onError: () => {
            toast.error("Failed to bid auction");
        },
    });

    return { bidAuction };
}