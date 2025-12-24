import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRaffleAnchorProgram } from "./useRaffleAnchorProgram";
import toast from "react-hot-toast";
import { cancelRaffleOverBackend } from "../api/routes/raffleRoutes";
import { useRouter } from "@tanstack/react-router";

export const useCancelRaffle = () => {
    const { cancelRaffleMutation } = useRaffleAnchorProgram();
    const router = useRouter();
    const queryClient = useQueryClient();
    const cancelRaffle = useMutation({
        mutationKey: ["cancelRaffle"],
        mutationFn: async (raffleId: number) => {
            const tx = await cancelRaffleMutation.mutateAsync({ raffleId });
            const response = await cancelRaffleOverBackend(raffleId.toString(),tx);
            if(response.error){
                throw new Error(response.error);
            }
            return raffleId;
        },
        onSuccess: (raffleId:number) => {
            queryClient.invalidateQueries({ queryKey: ["raffles",raffleId.toString()] });
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