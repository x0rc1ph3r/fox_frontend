import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRaffleAnchorProgram } from "./useRaffleAnchorProgram";
import toast from "react-hot-toast";
import { claimRafflePrize } from "../api/routes/raffleRoutes";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCheckAuth } from "./useCheckAuth";

export const useClaimRafflePrize = () => {
    const { buyerClaimPrizeMutation } = useRaffleAnchorProgram();
    const queryClient = useQueryClient();
    const { publicKey } = useWallet();
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
            if (!await validateForm(args.raffleId)) {
                throw new Error("Validation failed");
            }
            const tx = await buyerClaimPrizeMutation.mutateAsync(args);
            const response = await claimRafflePrize(args.raffleId.toString(), tx);
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