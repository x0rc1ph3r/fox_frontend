import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
// import type { AuctionTypeBackend } from "../types/backend/auctionTypes";
import { useWallet } from "@solana/wallet-adapter-react";
// import { VerifiedTokens } from "../src/utils/verifiedTokens";
import {
    bidInAuction,
    getBidAuctionTx,
} from "../api/routes/auctionRoutes";
import { useCheckAuth } from "./useCheckAuth";
import { connection } from "./helpers";
import { Transaction } from "@solana/web3.js";

interface BidAuctionArgs {
    highestBidder: string;
    auctionId: number;
    bidAmount: number;
}

export const useBidAuction = () => {
    const { publicKey, sendTransaction } = useWallet();
    const queryClient = useQueryClient();
    const { checkAndInvalidateToken } = useCheckAuth();

    const validateForm = async (args: BidAuctionArgs) => {
        try {
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }
            const isValid = await checkAndInvalidateToken(publicKey.toBase58());
            if (!isValid) {
                throw new Error("Signature verification failed");
            }
            if (args.highestBidder === publicKey.toBase58()) {
                throw new Error("You are already the highest bidder");
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

    const bidAuctionOverBackend = async (auctionId: number, txSignature: string, bidAmount: string) => {
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
        mutationKey: ["bidAuction", publicKey?.toBase58()],
        mutationFn: async (args: BidAuctionArgs) => {
            if (!(await validateForm(args))) {
                throw new Error("Validation failed");
            }
            const { base64Transaction, minContextSlot, blockhash, lastValidBlockHeight } = await getBidAuctionTx(args.auctionId, args.bidAmount);
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
            if (confirmation.value.err) {
                throw new Error("Failed to bid in auction");
            }
            await bidAuctionOverBackend(args.auctionId, signature, args.bidAmount.toString());
            return args.auctionId;
        },
        onSuccess: (auctionId: number) => {
            toast.success("Bid placed successfully");
            queryClient.invalidateQueries({
                queryKey: ["auction", auctionId.toString()],
            });
            queryClient.invalidateQueries({
                queryKey: ["auctions"]
            });
        },
        onError: () => {
            toast.error("Failed to bid auction");
        },
    });

    return { bidAuction };
}