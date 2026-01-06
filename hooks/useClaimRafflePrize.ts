import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { claimRafflePrize, getClaimRaffleTx } from "../api/routes/raffleRoutes";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCheckAuth } from "./useCheckAuth";
import { connection } from "./helpers";
import { Transaction } from "@solana/web3.js";

export const useClaimRafflePrize = () => {
    const queryClient = useQueryClient();
    const { publicKey, sendTransaction } = useWallet();
    const { checkAndInvalidateToken } = useCheckAuth();

    const validateForm = async (raffleId: number) => {
        try {
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }
            const isValid = await checkAndInvalidateToken(publicKey.toBase58());
            if (!isValid) {
                throw new Error("Signature verification failed");
            }
            if (!raffleId) {
                throw new Error("Raffle ID is required");
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

    const claimPrize = useMutation({
        mutationKey: ["claimPrize"],
        mutationFn: async (args: {
            raffleId: number;
        }) => {
            if (!(await validateForm(args.raffleId))) {
                throw new Error("Validation failed");
            }
            const { base64Transaction, minContextSlot, blockhash, lastValidBlockHeight } = await getClaimRaffleTx(args.raffleId.toString());
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
            const response = await claimRafflePrize(args.raffleId.toString(), signature);
            if (response.error) {
                throw new Error(response.error);
            }
            return args.raffleId;
        },
        onSuccess: (raffleId: number) => {
            queryClient.invalidateQueries({ queryKey: ["raffle", raffleId.toString()] });
            queryClient.invalidateQueries({ queryKey: ["raffleWinnersWhoClaimedPrize", raffleId.toString()] });
            toast.success("Prize claimed successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to claim prize");
        },
    });
    return {
        claimPrize
    };
};