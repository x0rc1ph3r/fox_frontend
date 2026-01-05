import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRaffleAnchorProgram } from "./useRaffleAnchorProgram";
import toast from "react-hot-toast";
import { cancelRaffleOverBackend } from "../api/routes/raffleRoutes";
import { useRouter } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCheckAuth } from "./useCheckAuth";

export const useCancelRaffle = () => {
    const { cancelRaffleMutation } = useRaffleAnchorProgram();
    const router = useRouter();
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

    const cancelRaffle = useMutation({
        mutationKey: ["cancelRaffle"],
        mutationFn: async (raffleId: number) => {
            if (!(await validateForm(raffleId))) {
                throw new Error("Validation failed");
            }
            const tx = await cancelRaffleMutation.mutateAsync({ raffleId });
            const response = await cancelRaffleOverBackend(raffleId.toString(), tx);
            if (response.error) {
                throw new Error(response.error);
            }
            return raffleId;
        },
        onSuccess: (raffleId: number) => {
            queryClient.invalidateQueries({ queryKey: ["raffle", raffleId.toString()] });
            queryClient.invalidateQueries({ queryKey: ["raffles", "All Raffles"] });
            toast.success("Raffle cancelled successfully");
            router.navigate({ to: "/raffles" });
        },
        onError: (error) => {
            console.error("Raffle cancelled failed:", error);
            toast.error("Raffle cancelled failed");
        },
    });
    return { cancelRaffle };
}   