import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRaffleAnchorProgram } from "./useRaffleAnchorProgram";
import toast from "react-hot-toast";
import { claimRafflePrize} from "../api/routes/raffleRoutes";

export const useClaimRafflePrize = () => {
    const { buyerClaimPrizeMutation } = useRaffleAnchorProgram();
    const queryClient = useQueryClient();
    const claimPrize = useMutation({
        mutationKey: ["claimPrize"],
        mutationFn: async (args: {
            raffleId: number;
        }) => {
            const tx = await buyerClaimPrizeMutation.mutateAsync(args);
            const response = await claimRafflePrize(args.raffleId.toString(),tx);
            if(response.error){
                throw new Error(response.error);
            }
            return args.raffleId;
        },
        onSuccess: (raffleId:number) => {
            queryClient.invalidateQueries({ queryKey: ["raffle", raffleId.toString()] });
            toast.success("Prize claimed successfully");
        },
        onError: (error) => {
            toast.error(error.message?error.message:error.toString());
        },
    });
    return {
        claimPrize
    };
};