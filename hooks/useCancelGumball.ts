import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGumballAnchorProgram } from "./useGumballAnchorProgram";
import toast from "react-hot-toast";
import { cancelGumballOverBackend } from "../api/routes/gumballRoutes";
import { useRouter } from "@tanstack/react-router";
export const useCancelGumball = () => {
    const { cancelAndClaimSelectedPrizesMutation } = useGumballAnchorProgram();
    const queryClient = useQueryClient();
    const router = useRouter();
    const cancelGumball = useMutation({
        mutationKey: ["cancelGumball"],
        mutationFn: async (args: {
            gumballId: number;
            prizeIndexes: number[];
        }) => {
            const tx = await cancelAndClaimSelectedPrizesMutation.mutateAsync({
                gumballId: args.gumballId,
                prizeIndexes: args.prizeIndexes,
            });
            const response = await cancelGumballOverBackend(args.gumballId.toString(),tx);
            if(response.error){
                throw new Error(response.error);
            }
            return args.gumballId;
        },
        onSuccess: (gumballId:number) => {
            queryClient.invalidateQueries({ queryKey: ["gumballs",gumballId.toString()] });
            queryClient.invalidateQueries({ queryKey: ["gumball",gumballId.toString()] });
            toast.success("Gumball cancelled successfully");
            router.navigate({ to: "/gumballs" });
        },
        onError: (error) => {
            console.error(error);
            toast.error("Gumball cancelled failed");
        },
    });
    return { cancelGumball };
}