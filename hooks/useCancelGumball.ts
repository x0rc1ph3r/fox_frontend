import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGumballAnchorProgram } from "./useGumballAnchorProgram";
import toast from "react-hot-toast";
import { cancelGumballOverBackend } from "../api/routes/gumballRoutes";
import { useRouter } from "@tanstack/react-router";
import { useCheckAuth } from "./useCheckAuth";
import { useWallet } from "@solana/wallet-adapter-react";
export const useCancelGumball = () => {
    const { cancelAndClaimSelectedPrizesMutation } = useGumballAnchorProgram();
    const queryClient = useQueryClient();
    const router = useRouter();
    const { publicKey } = useWallet();
    const { checkAndInvalidateToken } = useCheckAuth();

    const validateForm = async (args: { gumballId: number; prizeIndexes: number[] }) => {
        try {
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }
            const isValid = await checkAndInvalidateToken(publicKey.toBase58());
            if (!isValid) {
                throw new Error("Signature verification failed");
            }
            if (!args.gumballId) {
                throw new Error("Gumball ID is required");
            }
            if (!args.prizeIndexes || args.prizeIndexes.length === 0) {
                throw new Error("At least one prize index must be selected");
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

    const cancelGumball = useMutation({
        mutationKey: ["cancelGumball"],
        mutationFn: async (args: {
            gumballId: number;
            prizeIndexes: number[];
        }) => {
            if (!(await validateForm(args))) {
                throw new Error("Validation failed");
            }
            const tx = await cancelAndClaimSelectedPrizesMutation.mutateAsync({
                gumballId: args.gumballId,
                prizeIndexes: args.prizeIndexes,
            });
            const response = await cancelGumballOverBackend(args.gumballId.toString(), tx);
            if (response.error) {
                throw new Error(response.error);
            }
            return args.gumballId;
        },
        onSuccess: (gumballId: number) => {
            queryClient.invalidateQueries({ queryKey: ["gumballs", gumballId.toString()] });
            queryClient.invalidateQueries({ queryKey: ["gumball", gumballId.toString()] });
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