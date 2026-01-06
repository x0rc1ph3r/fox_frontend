import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
// import type { AuctionTypeBackend } from "../types/backend/auctionTypes";
import { useWallet } from "@solana/wallet-adapter-react";
// import { VerifiedTokens } from "../src/utils/verifiedTokens";
import {
    cancelAuctionOverBackend,
    getCancelAuctionTx
} from "../api/routes/auctionRoutes";
import { useCheckAuth } from "./useCheckAuth";
import { connection } from "./helpers";
import { Transaction } from "@solana/web3.js";

interface CancelAuctionArgs {
    auctionId: number;
}

export const useCancelAuction = () => {
    const { publicKey, sendTransaction } = useWallet();
    const queryClient = useQueryClient();
    const { checkAndInvalidateToken } = useCheckAuth();

    const validateForm = async (args: CancelAuctionArgs) => {
        try {
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }
            const isValid = await checkAndInvalidateToken(publicKey.toBase58());
            if (!isValid) {
                throw new Error("Signature verification failed");
            }
            if (!args.auctionId) {
                throw new Error("Auction ID is required");
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

    const cancelAuction = useMutation({
        mutationKey: ["cancelAuction", publicKey?.toBase58()],
        mutationFn: async (args: CancelAuctionArgs) => {
            if (!(await validateForm(args))) {
                throw new Error("Validation failed");
            }
            const { base64Transaction, minContextSlot, blockhash, lastValidBlockHeight } = await getCancelAuctionTx(args.auctionId.toString());
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
                throw new Error("Failed to cancel auction");
            }
            const response = await cancelAuctionOverBackend(args.auctionId.toString(), signature);
            if (response.error) {
                throw new Error(response.error);
            }
            return args.auctionId;
        },
        onSuccess: (auctionId: number) => {
            toast.success("Auction cancelled successfully");
            queryClient.invalidateQueries({
                queryKey: ["auction", auctionId],
            });
            queryClient.invalidateQueries({
                queryKey: ["auctions"]
            });
        },
        onError: () => {
            toast.error("Failed to cancel auction");
        },
    });

    return { cancelAuction };
}